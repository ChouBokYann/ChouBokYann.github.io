import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import EvidenceSampler from '../../src/components/project/EvidenceSampler.vue';

const groups = [
  { id: 'architecture', label: 'Architecture', items: ['candidate generation', 'ranking'] },
  { id: 'metrics', label: 'Metrics', items: ['Recall@20: test fixture value'] },
  { id: 'code', label: 'Code', items: ['Typed feature contract'] },
  { id: 'stack', label: 'Stack', items: ['Python', 'PyTorch'] },
];

describe('EvidenceSampler', () => {
  it('shows architecture first and switches panels from the keyboard', async () => {
    render(EvidenceSampler, { props: { groups } });
    expect(screen.getByRole('tabpanel')).toHaveTextContent('candidate generation');

    const architecture = screen.getByRole('tab', { name: 'Architecture' });
    await fireEvent.keyDown(architecture, { key: 'ArrowRight' });
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Recall@20');
    expect(screen.getByRole('tab', { name: 'Metrics' })).toHaveFocus();
  });

  it('renders every evidence item in the document', () => {
    const { container } = render(EvidenceSampler, { props: { groups } });
    expect(container).toHaveTextContent('Typed feature contract');
    expect(container).toHaveTextContent('PyTorch');
  });
});
