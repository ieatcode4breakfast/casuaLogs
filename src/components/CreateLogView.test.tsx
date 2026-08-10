import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CreateLogView } from './CreateLogView';
import { getTemplates } from '../services/templateService';
import { saveLog } from '../services/logService';

vi.mock('../services/templateService', () => ({
  getTemplates: vi.fn(),
}));

vi.mock('../services/logService', () => ({
  saveLog: vi.fn(),
}));

describe('CreateLogView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders log form correctly based on template', async () => {
    const mockTemplates = [
      { 
        id: '1', 
        name: 'Daily Log', 
        createdAt: '2026-08-10', 
        blocks: [
          { id: 'b1', type: 'header', level: 1, text: 'Morning Routine' },
          { id: 'b2', type: 'text', inputType: 'short', label: 'Mood' },
        ] 
      },
    ];
    (getTemplates as any).mockResolvedValue(mockTemplates);

    render(<CreateLogView onNavigate={vi.fn()} templateId="1" />);

    expect(await screen.findByDisplayValue('Daily Log')).toBeTruthy(); // The title input
    expect(screen.getByText('Morning Routine')).toBeTruthy();
    expect(screen.getByText('Mood')).toBeTruthy();
    expect(screen.getByLabelText('Mood')).toBeTruthy(); // The short input
  });

  it('initializes the log title with the template name', async () => {
    const mockTemplates = [
      { id: '1', name: 'My Special Template', createdAt: '2026-08-10', blocks: [] },
    ];
    (getTemplates as any).mockResolvedValue(mockTemplates);

    render(<CreateLogView onNavigate={vi.fn()} templateId="1" />);

    const titleInput = await screen.findByPlaceholderText('Log Title');
    expect((titleInput as HTMLInputElement).value).toBe('My Special Template');
  });

  it('does not render editing controls', async () => {
    const mockTemplates = [{ 
      id: '1', name: 'Log', createdAt: '2026-08-10', blocks: [{ id: 'b1', type: 'header', level: 1, text: 'H' }] 
    }];
    (getTemplates as any).mockResolvedValue(mockTemplates);

    render(<CreateLogView onNavigate={vi.fn()} templateId="1" />);
    await screen.findByText('H');

    // These buttons should not exist
    expect(screen.queryByText('Add Block')).toBeNull();
    expect(screen.queryByTitle('Delete Block')).toBeNull();
  });

  it('captures input and saves log', async () => {
    const mockTemplates = [
      { 
        id: '1', 
        name: 'Daily Log', 
        createdAt: '2026-08-10', 
        blocks: [
          { id: 'b2', type: 'text', inputType: 'short', label: 'Mood' },
        ] 
      },
    ];
    (getTemplates as any).mockResolvedValue(mockTemplates);
    const mockNavigate = vi.fn();

    render(<CreateLogView onNavigate={mockNavigate} templateId="1" />);

    const titleInput = await screen.findByPlaceholderText('Log Title');
    fireEvent.change(titleInput, { target: { value: 'My Awesome Daily Log' } });

    const shortInput = await screen.findByLabelText('Mood');
    fireEvent.change(shortInput, { target: { value: 'Happy' } });

    const saveBtn = screen.getByRole('button', { name: 'Save Log' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(saveLog).toHaveBeenCalledWith({
        title: 'My Awesome Daily Log',
        blocks: [
          { id: 'b2', type: 'text', inputType: 'short', label: 'Mood', value: 'Happy' }
        ]
      });
      expect(mockNavigate).toHaveBeenCalledWith('home');
    });
  });

  it('handles service errors via toast', async () => {
    const mockTemplates = [
      { 
        id: '1', name: 'Log', createdAt: '2026-08-10', blocks: [
          { id: 'b2', type: 'text', inputType: 'short', label: 'Mood' },
        ] 
      },
    ];
    (getTemplates as any).mockResolvedValue(mockTemplates);
    (saveLog as any).mockRejectedValue(new Error('Validation Failed'));

    render(<CreateLogView onNavigate={vi.fn()} templateId="1" />);

    const saveBtn = await screen.findByRole('button', { name: 'Save Log' });
    fireEvent.click(saveBtn);

    expect(await screen.findByText('Validation Failed')).toBeTruthy();
  });
});
