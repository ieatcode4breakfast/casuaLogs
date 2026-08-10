import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SelectTemplateView } from './SelectTemplateView';
import { getTemplates } from '../services/templateService';

vi.mock('../services/templateService', () => ({
  getTemplates: vi.fn(),
}));

describe('SelectTemplateView', () => {
  it('renders empty state when no templates exist', async () => {
    (getTemplates as any).mockResolvedValue([]);
    render(<SelectTemplateView onNavigate={vi.fn()} />);

    expect(await screen.findByText('No templates available')).toBeTruthy();
    expect(screen.getByText(/You need to create a template first/)).toBeTruthy();
  });

  it('renders list of templates', async () => {
    const mockTemplates = [
      { id: '1', name: 'Workout Log', createdAt: '2026-08-10', blocks: [] },
      { id: '2', name: 'Diet Log', createdAt: '2026-08-10', blocks: [] },
    ];
    (getTemplates as any).mockResolvedValue(mockTemplates);
    
    render(<SelectTemplateView onNavigate={vi.fn()} />);

    expect(await screen.findByText('Workout Log')).toBeTruthy();
    expect(screen.getByText('Diet Log')).toBeTruthy();
  });

  it('navigates to create-log on template click', async () => {
    const mockTemplates = [
      { id: '1', name: 'Workout Log', createdAt: '2026-08-10', blocks: [] },
    ];
    (getTemplates as any).mockResolvedValue(mockTemplates);
    
    const mockNavigate = vi.fn();
    render(<SelectTemplateView onNavigate={mockNavigate} />);

    const templateCard = await screen.findByText('Workout Log');
    fireEvent.click(templateCard);

    expect(mockNavigate).toHaveBeenCalledWith('create-log', '1');
  });
});
