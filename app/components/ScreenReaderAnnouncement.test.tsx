import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScreenReaderAnnouncement } from './ScreenReaderAnnouncement';

describe('ScreenReaderAnnouncement', () => {
  it('renders with role="status"', () => {
    const { container } = render(
      <ScreenReaderAnnouncement message="หมวดหมู่ขยายแล้ว" />
    );

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toBeInTheDocument();
  });

  it('has aria-live="polite" for non-interrupting announcements', () => {
    const { container } = render(
      <ScreenReaderAnnouncement message="หมวดหมู่ขยายแล้ว" />
    );

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-atomic="true" for complete announcements', () => {
    const { container } = render(
      <ScreenReaderAnnouncement message="หมวดหมู่ขยายแล้ว" />
    );

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toHaveAttribute('aria-atomic', 'true');
  });

  it('renders the Thai expanded message correctly', () => {
    const { container } = render(
      <ScreenReaderAnnouncement message="หมวดหมู่ขยายแล้ว" />
    );

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toHaveTextContent('หมวดหมู่ขยายแล้ว');
  });

  it('renders the Thai collapsed message correctly', () => {
    const { container } = render(
      <ScreenReaderAnnouncement message="หมวดหมู่ยุบแล้ว" />
    );

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toHaveTextContent('หมวดหมู่ยุบแล้ว');
  });

  it('renders empty message when cleared', () => {
    const { container } = render(
      <ScreenReaderAnnouncement message="" />
    );

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toHaveTextContent('');
  });

  it('is visually hidden with sr-only class', () => {
    const { container } = render(
      <ScreenReaderAnnouncement message="หมวดหมู่ขยายแล้ว" />
    );

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toHaveClass('sr-only');
  });

  it('updates message when prop changes', () => {
    const { container, rerender } = render(
      <ScreenReaderAnnouncement message="หมวดหมู่ขยายแล้ว" />
    );

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toHaveTextContent('หมวดหมู่ขยายแล้ว');

    // Update the message
    rerender(<ScreenReaderAnnouncement message="หมวดหมู่ยุบแล้ว" />);

    expect(statusElement).toHaveTextContent('หมวดหมู่ยุบแล้ว');
  });
});
