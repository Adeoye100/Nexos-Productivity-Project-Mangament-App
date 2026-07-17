import React, { useState } from 'react';
import { useYMap } from '@/lib/sync/useYMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function SyncTestPage() {
  const { state, set, remove } = useYMap<string>('test-items');
  const [newItem, setNewItem] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      const id = Date.now().toString();
      set(id, newItem.trim());
      setNewItem('');
    }
  };

  const startEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditingValue(value);
  };

  const saveEdit = () => {
    if (editingKey && editingValue.trim()) {
      set(editingKey, editingValue.trim());
      setEditingKey(null);
      setEditingValue('');
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Yjs Sync Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add new dummy entry..."
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <Button onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>

          <div className="space-y-3">
            {Object.entries(state).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No items yet. Add one above!</p>
            ) : (
              Object.entries(state).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  {editingKey === key ? (
                    <div className="flex gap-2 flex-1 mr-2">
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        autoFocus
                      />
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingKey(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1">{value}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(key, value)}>
                          <Edit2 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(key)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-muted-foreground space-y-2">
            <p><strong>Test Instructions:</strong></p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Add some items to this list.</li>
              <li>Reload the page — the items should persist (via IndexedDB).</li>
              <li>Open this same URL in another browser tab.</li>
              <li>Change items in one tab and watch the other tab update instantly.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
