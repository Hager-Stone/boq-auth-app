'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/firebase/clientApp';
import * as XLSX from 'xlsx';
import AuthGuard from '@/components/AuthGuard';
import UserInfo from '@/components/UserInfo';
import ThemeToggle from '@/components/ThemeToggle';

type SheetRow = {
  Category: string;
  Description: string;
  Unit: string;
  Rate: number;
};

type BoqItem = SheetRow & {
  Quantity: number;
  Amount: number;
};

export default function BoqPage() {
  const [sheetData, setSheetData] = useState<SheetRow[]>([]);
  const [category, setCategory] = useState('');
  const [itemList, setItemList] = useState<SheetRow[]>([]);
  const [selectedItem, setSelectedItem] = useState<SheetRow | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [boqItems, setBoqItems] = useState<BoqItem[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedItem, setEditedItem] = useState<Partial<BoqItem>>({});
  const [editError, setEditError] = useState<string | null>(null);
  const router = useRouter();
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const sheetURL = 'https://script.google.com/macros/s/AKfycbxH9ztr9pidKOWWu_Jway8AAUdA6HinZnVbuJrQt2kt8QTGMdHcurkK7wytwZDo19akYg/exec';

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUserEmail(user.email);
      }
    });

    const fetchData = async () => {
      try {
        setLoadingData(true);
        const res = await fetch(sheetURL);
        if (!res.ok) throw new Error('Failed to fetch sheet data');
        const data = await res.json();
        setSheetData(data);
      } catch {
        alert('Failed to load BOQ data. Please refresh the page.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const filtered = sheetData.filter((item) => item.Category === category);
    setItemList(filtered);
    setSelectedItem(null);
  }, [category, sheetData]);

  useEffect(() => {
    const savedBoq = localStorage.getItem('boqData');
    if (savedBoq) {
      try {
        setBoqItems(JSON.parse(savedBoq));
      } catch {
        localStorage.removeItem('boqData');
      }
    }
  }, []);

  useEffect(() => {
    if (boqItems.length > 0) {
      localStorage.setItem('boqData', JSON.stringify(boqItems));
    } else {
      localStorage.removeItem('boqData');
    }
  }, [boqItems]);

  const addItem = () => {
    if (!category || !selectedItem || quantity <= 0) {
      alert('Please fill out all fields correctly.');
      return;
    }
    const amount = selectedItem.Rate * quantity;
    setBoqItems([...boqItems, { ...selectedItem, Quantity: quantity, Amount: amount }]);
  };

  const removeItem = (index: number) => {
    const updated = [...boqItems];
    updated.splice(index, 1);
    setBoqItems(updated);
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditedItem(boqItems[index]);
  };

  const saveEdit = () => {
    if (editIndex === null) return;
    const updated = [...boqItems];
    updated[editIndex] = {
      ...(editedItem as BoqItem),
      Quantity: Number(editedItem.Quantity),
      Amount: Number(editedItem.Rate) * Number(editedItem.Quantity)
    };
    setBoqItems(updated);
    setEditIndex(null);
    setEditedItem({});
  };

  const handleEditChange = (field: keyof BoqItem, value: string | number) => {
    if ((field === "Rate" || field === "Quantity") && Number.isNaN(Number(value))) {
      setEditError(`Please enter a valid number for ${field}`);
      return;
    }
    setEditError(null);
    setEditedItem(prev => ({
      ...prev,
      [field]: field === "Rate" || field === "Quantity" ? Number(value) : value
    }));
  };

  const downloadExcel = async () => {
    try {
      setLoadingData(true);
      const worksheet = XLSX.utils.json_to_sheet(boqItems);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'BOQ');
      XLSX.writeFile(workbook, 'BOQ_Generated.xlsx');
    } catch {
      alert('Failed to download Excel file.');
    } finally {
      setLoadingData(false);
    }
  };

  const categories = Array.from(new Set(sheetData.map((item) => item.Category)));

  if (loadingData) {
    return <div className="p-6 text-center text-gray-600">⏳ Loading BOQ data, please wait...</div>;
  }

  return (
    <AuthGuard>
      <div className="p-6 max-w-5xl mx-auto">
        <UserInfo />
        {userEmail === 'global@hagerstone.com' && (
          <div className="mb-4 text-right">
            <button onClick={() => router.push('/admin')} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
              🔐 Go to Admin Panel
            </button>
          </div>
        )}

        <h1 className="text-2xl font-bold mb-6">📋 BOQ Generator</h1>

        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        {/* Form Row */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1">
            <label className="block font-medium mb-1">Select Category:</label>
            <select className="w-full border p-2 rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">-- Choose Category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block font-medium mb-1">Search Items:</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="Search by item name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="flex-1">
            <label className="block font-medium mb-1">Select Item:</label>
            <select className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white" onChange={(e) => setSelectedItem(JSON.parse(e.target.value))}>
              <option value="">-- Choose Item --</option>
              {itemList.filter(item => item.Description.toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
                <option key={idx} value={JSON.stringify(item)}>{item.Description}</option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="block font-medium mb-1">Quantity:</label>
            <input type="number" className="w-full border p-2 rounded" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>

          <button onClick={addItem} className="self-end bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ➕ Add to BOQ
          </button>
        </div>

        {/* Table */}
        <table className="w-full border mt-4 text-sm">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border p-2">Category</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Unit</th>
              <th className="border p-2">Rate</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {boqItems.map((item, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  {editIndex === idx ? (
                    <>
                      <td><input className="border p-1 w-full" value={editedItem.Category || ''} onChange={(e) => handleEditChange("Category", e.target.value)} /></td>
                      <td><input className="border p-1 w-full" value={editedItem.Description || ''} onChange={(e) => handleEditChange("Description", e.target.value)} /></td>
                      <td><input className="border p-1 w-full" value={editedItem.Unit || ''} onChange={(e) => handleEditChange("Unit", e.target.value)} /></td>
                      <td><input type="number" className="border p-1 w-full" value={editedItem.Rate || 0} onChange={(e) => handleEditChange("Rate", e.target.value)} /></td>
                      <td><input type="number" className="border p-1 w-full" value={editedItem.Quantity || 0} onChange={(e) => handleEditChange("Quantity", e.target.value)} /></td>
                      <td>₹ {(Number(editedItem.Rate) * Number(editedItem.Quantity)).toFixed(2)}</td>
                      <td><button className="text-green-600 underline text-sm" onClick={saveEdit}>Save</button></td>
                    </>
                  ) : (
                    <>
                      <td>{item.Category}</td>
                      <td>{item.Description}</td>
                      <td>{item.Unit}</td>
                      <td>{item.Rate}</td>
                      <td>{item.Quantity}</td>
                      <td>{item.Amount.toFixed(2)}</td>
                      <td>
                        <button className="text-blue-600 underline text-sm mr-2" onClick={() => startEdit(idx)}>Edit</button>
                        <button className="text-red-600 underline text-sm" onClick={() => removeItem(idx)}>Remove</button>
                      </td>
                    </>
                  )}
                </tr>
                {editIndex === idx && editError && (
                  <tr>
                    <td colSpan={7} className="text-red-600 text-sm p-2">⚠️ {editError}</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
              <td colSpan={5} className="text-right font-semibold p-2">Total</td>
              <td className="font-semibold p-2">₹ {boqItems.reduce((sum, item) => sum + item.Amount, 0).toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        {boqItems.length > 0 && (
          <div className="flex justify-between mt-4">
            <button onClick={() => setBoqItems([])} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">🗑️ Clear BOQ</button>
            <button onClick={downloadExcel} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">📥 Download Excel</button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
