import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';

const CrudTable = ({ columns, data = [], onEdit, onDelete, onView, actions = true }) => {
    // Helper: Format Data Sel dengan Aman
    const renderCell = (item, col) => {
        // 1. Jika ada custom render function
        if (col.render) {
            return col.render(item);
        }

        // 2. Ambil value dasar
        const value = item[col.accessor];

        // 3. Handle Null/Undefined
        if (value === null || value === undefined) {
            return '-';
        }

        // 4. Handle Array (Contoh: List Fasilitas) -> Join koma
        if (Array.isArray(value)) {
            return value.join(', ');
        }

        // 5. Handle Object (Error [object Object] yang Anda alami)
        if (typeof value === 'object') {
            // Coba ambil properti umum 'name' atau 'label' jika ada, kalau tidak JSON stringify
            return value.name || value.label || JSON.stringify(value);
        }

        // 6. Default String
        return value;
    };

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-100">
                <p className="text-gray-500">Belum ada data tersedia.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                No
                            </th>
                            {columns.map((col, idx) => (
                                <th 
                                    key={idx} 
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {actions && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, rowIndex) => (
                            <tr key={item.id || rowIndex} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {rowIndex + 1}
                                </td>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${col.className || ''}`}>
                                        {renderCell(item, col)}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {onView && (
                                            <button onClick={() => onView(item)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1 rounded">
                                                <Eye size={16} />
                                            </button>
                                        )}
                                        {onEdit && (
                                            <button onClick={() => onEdit(item)} className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 p-1 rounded">
                                                <Edit size={16} />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm('Yakin ingin menghapus data ini?')) {
                                                        onDelete(item.id);
                                                    }
                                                }} 
                                                className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CrudTable;