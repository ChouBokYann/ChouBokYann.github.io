import { cleanup, fireEvent, render, screen } from '@testing-library/vue';
import { afterEach, describe, expect, it } from 'vitest';
import GalleryViewer from '../../src/components/gallery/GalleryViewer.vue';

const items = [
  {
    id: 'one',
    src: '/one.jpg',
    alt: 'First test photograph',
    title: 'One',
    location: 'Test place',
    date: 'Jan 2026',
  },
  {
    id: 'two',
    src: '/two.jpg',
    alt: 'Second test photograph',
    title: 'Two',
    location: 'Test place',
    date: 'Feb 2026',
  },
];

describe('GalleryViewer', () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('opens, advances, and closes from the keyboard', async () => {
    render(GalleryViewer, { props: { items } });

    await fireEvent.click(screen.getByRole('button', { name: 'Open One' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('One');

    await fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('dialog')).toHaveTextContent('Two');

    await fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps focus and background scrolling with the dialog state', async () => {
    document.body.style.overflow = 'clip';
    render(GalleryViewer, { props: { items } });
    const trigger = screen.getByRole('button', { name: 'Open One' });

    trigger.focus();
    await fireEvent.click(trigger);

    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    await fireEvent.keyDown(window, { key: 'Escape' });

    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('clip');
  });
});
