import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; // Adjust this import path to match your project!

const AdminLiveExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', description: '' });

  // 1. Fetch initial data and set up the Live Listener
  useEffect(() => {
    fetchExpenses();

    // The magical live listener
    const expenseSubscription = supabase
      .channel('live-admin-expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, (payload) => {
        console.log("Live update received!", payload);
        // The easiest way to ensure data is perfectly synced during your demo 
        // is to just re-fetch the list whenever ANY change happens!
        fetchExpenses(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(expenseSubscription);
    };
  }, []);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false }); // Newest expenses at the top

    if (error) console.error("Error fetching expenses:", error);
    else setExpenses(data);
  };

  // 2. Handle Edit Button Click
  const handleEditClick = (expense) => {
    setEditingId(expense.id);
    setEditForm({ amount: expense.amount, description: expense.description });
  };

  // 3. Save the Edited Row back to Supabase
  const handleSaveEdit = async (id) => {
    const { error } = await supabase
      .from('expenses')
      .update({ 
        amount: editForm.amount, 
        description: editForm.description 
      })
      .eq('id', id);

    if (error) {
      alert("Failed to update: " + error.message);
    } else {
      setEditingId(null); // Close the editing input fields
      // The live listener will automatically see this update and refresh the table!
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔴 Live Fleet Expenses</h2>
      
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th>Date</th>
            <th>Truck ID</th>
            <th>Description</th>
            <th>Amount (₹)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{new Date(exp.created_at).toLocaleDateString()}</td>
              <td><strong>{exp.vehicle_id.toUpperCase()}</strong></td>
              
              {/* If this row is being edited, show inputs. Otherwise, show text. */}
              {editingId === exp.id ? (
                <>
                  <td>
                    <input 
                      value={editForm.description} 
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})} 
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={editForm.amount} 
                      onChange={(e) => setEditForm({...editForm, amount: e.target.value})} 
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSaveEdit(exp.id)} style={{ backgroundColor: 'green', color: 'white' }}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{exp.description}</td>
                  <td>₹{exp.amount}</td>
                  <td>
                    <button onClick={() => handleEditClick(exp)}>Edit</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLiveExpenses;