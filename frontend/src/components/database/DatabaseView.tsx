'use client';

import { useState, useEffect, useCallback } from 'react';
import { databaseApi } from '@/lib/api';
import { Database, DatabaseProperty, DatabaseRow } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatabaseViewProps {
  databaseId: string;
}

export function DatabaseView({ databaseId }: DatabaseViewProps) {
  const [database, setDatabase] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [cellValue, setCellValue] = useState('');

  const loadDatabase = useCallback(async () => {
    try {
      const { data } = await databaseApi.getById(databaseId);
      setDatabase(data);
    } finally {
      setLoading(false);
    }
  }, [databaseId]);

  useEffect(() => {
    loadDatabase();
  }, [loadDatabase]);

  const handleAddProperty = async () => {
    const name = window.prompt('Property name:');
    if (!name) return;
    await databaseApi.addProperty(databaseId, { name, type: 'text' });
    loadDatabase();
  };

  const handleDeleteProperty = async (propertyId: string) => {
    await databaseApi.deleteProperty(databaseId, propertyId);
    loadDatabase();
  };

  const handleAddRow = async () => {
    await databaseApi.createRow(databaseId);
    loadDatabase();
  };

  const handleDeleteRow = async (rowId: string) => {
    await databaseApi.deleteRow(databaseId, rowId);
    loadDatabase();
  };

  const handleCellEdit = (cellKey: string, currentValue: string) => {
    setEditingCell(cellKey);
    setCellValue(currentValue);
  };

  const handleCellSave = async (rowId: string, propertyId: string) => {
    await databaseApi.updateRow(databaseId, rowId, {
      [propertyId]: cellValue,
    });
    setEditingCell(null);
    loadDatabase();
  };

  const getCellValue = (row: DatabaseRow, property: DatabaseProperty): string => {
    const cell = row.cells.find((c) => c.propertyId === property.id);
    if (!cell || cell.value === null) return '';
    if (typeof cell.value === 'string') return cell.value;
    return String(cell.value);
  };

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading database...</div>;
  }

  if (!database) {
    return <div className="p-4 text-muted-foreground">Database not found</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{database.name}</h2>
        {database.description && (
          <p className="text-sm text-muted-foreground mt-1">{database.description}</p>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-8 p-2" />
              {database.properties.map((prop) => (
                <th
                  key={prop.id}
                  className="group relative min-w-[150px] border-l p-2 text-left text-sm font-medium"
                >
                  <div className="flex items-center justify-between">
                    <span>{prop.name}</span>
                    <button
                      onClick={() => handleDeleteProperty(prop.id)}
                      className="hidden group-hover:block text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">{prop.type}</span>
                </th>
              ))}
              <th className="w-10 border-l p-2">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddProperty}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {database.rows.map((row) => (
              <tr key={row.id} className="group border-b hover:bg-muted/30">
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                {database.properties.map((prop) => {
                  const cellKey = `${row.id}-${prop.id}`;
                  const value = getCellValue(row, prop);
                  const isEditing = editingCell === cellKey;

                  return (
                    <td
                      key={cellKey}
                      className={cn(
                        'border-l p-0 text-sm',
                        isEditing && 'ring-2 ring-ring ring-inset'
                      )}
                    >
                      {isEditing ? (
                        <Input
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => handleCellSave(row.id, prop.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellSave(row.id, prop.id);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="h-full w-full border-0 rounded-none focus-visible:ring-0"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="min-h-[32px] px-2 py-1 cursor-text"
                          onClick={() => handleCellEdit(cellKey, value)}
                        >
                          {value || <span className="text-muted-foreground/50">Empty</span>}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="border-l" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={handleAddRow}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        New row
      </Button>
    </div>
  );
}
