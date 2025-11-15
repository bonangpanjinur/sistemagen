import React from 'react';
import { Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Spinner from './Spinner.jsx'; // PERBAIKAN: Import Spinner dengan .jsx

const CrudTable = ({
    columns,
    data,
    loading,
    sortBy,
    onSort,
    onEdit,
    onDelete,
    renderRowActions,
    userCapabilities, // 'super_admin' or ['cap1', 'cap2']
    editCapability,
    deleteCapability
}) => {

    const canPerformAction = (capability) => {
        if (!capability) return true; // No specific capability required
        if (!userCapabilities) return false; // User has no capabilities
        if (userCapabilities === 'super_admin' || userCapabilities.includes('manage_options')) return true; // Super admin
        return userCapabilities.includes(capability);
    };
    
    const canEdit = canPerformAction(editCapability);
    const canDelete = canPerformAction(deleteCapability);

    if (loading && data.length === 0) {
        return (
            <div className="flex justify-center items-center p-6">
                {/* PERBAIKAN: Ganti placeholder dengan Spinner */}
                <Spinner text="Memuat data..." />
            </div>
        );
    }

    if (data.length === 0) {
        return <p className="text-center p-6 text-gray-500">Tidak ada data ditemukan.</p>;
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.accessor}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => col.sortable && onSort(col.accessor)}
                            >
                                <div className="flex items-center">
                                    {col.Header}
                                    {col.sortable && (
                                        <span className="ml-2">
                                            {sortBy.field === col.accessor ? (
                                                sortBy.order === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            ) : (
                                                <ArrowUp size={14} className="text-gray-300" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                        {(onEdit || onDelete || renderRowActions) && (
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading && data.length > 0 && (
                        <tr>
                            {/* PERBAIKAN: Ganti placeholder dengan Spinner */}
                            <td colSpan={columns.length + (onEdit || onDelete || renderRowActions ? 1 : 0)} className="p-4 text-center">
                                <Spinner text="Memuat..." />
                            </td>
                        </tr>
                    )}
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            {columns.map((col) => (
                                <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {col.render ? col.render(item[col.accessor], item) : item[col.accessor]}
                                </td>
                            ))}
                            {(onEdit || onDelete || renderRowActions) && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {renderRowActions && renderRowActions(item)}
                                    {onEdit && canEdit && (
                                        <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900">
                                            <Edit size={16} />
                                        </button>
                                    )}
                                    {onDelete && canDelete && (
                                        <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900">
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
    );
};

export default CrudTable;