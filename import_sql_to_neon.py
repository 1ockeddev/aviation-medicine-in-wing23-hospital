#!/usr/bin/env python3
import psycopg2
import re

NEON_DB = "postgresql://neondb_owner:npg_0fdQ8ngtXirV@ep-curly-resonance-atnsky0d-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"

def parse_insert_statements(sql_file, table_name):
    """Extract INSERT statements for a specific table from SQL file"""
    with open(sql_file, 'r') as f:
        content = f.read()
    
    pattern = rf"INSERT INTO public\.{table_name} VALUES \((.*?)\);"
    matches = re.findall(pattern, content, re.DOTALL)
    return matches

def main():
    print("🚀 Starting migration from SQL file to Neon...\n")
    
    try:
        # Connect to Neon
        print("📥 Connecting to Neon database...")
        conn = psycopg2.connect(NEON_DB)
        cur = conn.cursor()
        print("   ✓ Connected\n")
        
        # Clear database
        print("🗑️  Clearing Neon database...")
        cur.execute("DELETE FROM medications")
        cur.execute("DELETE FROM categories")
        cur.execute("DELETE FROM users")
        conn.commit()
        print("   ✓ Cleared\n")
        
        # Parse SQL file
        print("📖 Parsing medication_db.sql...")
        sql_file = 'medication_db.sql'
        
        # Read and parse
        with open(sql_file, 'r') as f:
            content = f.read()
        
        # Extract users
        users_match = re.search(r"-- Data for Name: users.*?INSERT INTO public\.users VALUES \((.*?)\);", content, re.DOTALL)
        
        # Extract categories - get all lines between category section markers
        categories_section = re.search(r"-- Data for Name: categories.*?(?=-- Data for Name: medications)", content, re.DOTALL)
        category_inserts = []
        if categories_section:
            category_lines = re.findall(r"INSERT INTO public\.categories VALUES \((.*?)\);", categories_section.group(0), re.DOTALL)
            category_inserts = category_lines
        
        # Extract medications
        medications_section = re.search(r"-- Data for Name: medications.*", content, re.DOTALL)
        medication_inserts = []
        if medications_section:
            medication_lines = re.findall(r"INSERT INTO public\.medications VALUES \((.*?)\);", medications_section.group(0), re.DOTALL)
            medication_inserts = medication_lines
        
        print(f"   - Users: {1 if users_match else 0}")
        print(f"   - Categories: {len(category_inserts)}")
        print(f"   - Medications: {len(medication_inserts)}\n")
        
        # Insert users
        if users_match:
            print("📤 Inserting users...")
            cur.execute(f"INSERT INTO users VALUES ({users_match.group(1)})")
            print("   ✓ Inserted 1 user\n")
        
        # Insert categories
        print("📤 Inserting categories...")
        inserted_categories = set()
        remaining_categories = category_inserts.copy()
        attempts = 0
        max_attempts = len(category_inserts) + 10
        
        while remaining_categories and attempts < max_attempts:
            attempts += 1
            for insert_values in remaining_categories[:]:
                try:
                    cur.execute(f"INSERT INTO categories VALUES ({insert_values})")
                    conn.commit()
                    remaining_categories.remove(insert_values)
                    inserted_categories.add(insert_values)
                except psycopg2.errors.ForeignKeyViolation:
                    conn.rollback()
                    continue
                except Exception as e:
                    conn.rollback()
                    print(f"   ⚠️  Skipped category due to error: {str(e)[:100]}")
                    remaining_categories.remove(insert_values)
        
        print(f"   ✓ Inserted {len(inserted_categories)} categories")
        if remaining_categories:
            print(f"   ⚠️  {len(remaining_categories)} categories could not be inserted\n")
        else:
            print()
        
        # Insert medications
        print("📤 Inserting medications...")
        inserted_medications = 0
        for insert_values in medication_inserts:
            try:
                cur.execute(f"INSERT INTO medications VALUES ({insert_values})")
                conn.commit()
                inserted_medications += 1
            except Exception as e:
                conn.rollback()
                # Silent skip for medications with missing categories
                continue
        
        print(f"   ✓ Inserted {inserted_medications} medications\n")
        
        # Verify
        print("✅ Verifying migration...")
        cur.execute("SELECT COUNT(*) FROM users")
        print(f"   - Users: {cur.fetchone()[0]}")
        
        cur.execute("SELECT COUNT(*) FROM categories")
        print(f"   - Categories: {cur.fetchone()[0]}")
        
        cur.execute("SELECT COUNT(*) FROM medications")
        print(f"   - Medications: {cur.fetchone()[0]}")
        
        print("\n🎉 Migration completed!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        raise
    
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
