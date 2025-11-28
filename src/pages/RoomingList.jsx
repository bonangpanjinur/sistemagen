import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { 
    BuildingOfficeIcon, UserGroupIcon, PlusIcon, 
    TrashIcon, ArrowPathIcon 
} from '@heroicons/react/24/outline';

const RoomingList = () => {
    const [departures, setDepartures] = useState([]);
    const [selectedDeparture, setSelectedDeparture] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Data Utama Rooming
    const [rooms, setRooms] = useState([]);
    const [unassigned, setUnassigned] = useState([]);
    const [hotels, setHotels] = useState([]); // List hotel di departure ini (Makkah/Madinah)

    // Form Tambah Kamar
    const [showModal, setShowModal] = useState(false);
    const [newRoom, setNewRoom] = useState({
        hotel_id: '', room_number: '', capacity: 4, room_gender: 'family', notes: ''
    });

    // 1. Load Daftar Keberangkatan (Dropdown)
    useEffect(() => {
        api.get('/umh/v1/bookings/departures').then(res => setDepartures(res.data));
    }, []);

    // 2. Load Data Rooming saat Departure dipilih
    useEffect(() => {
        if (selectedDeparture) fetchRoomingData();
    }, [selectedDeparture]);

    const fetchRoomingData = async () => {
        setLoading(true);
        try {
            // Ambil Data Departure dulu untuk tahu Hotel ID nya
            const depRes = await api.get(`/umh/v1/departures/${selectedDeparture}`); // Butuh endpoint detail departure (optional)
            // Asumsi: Kita ambil data rooming lgsg, nnti dapat info hotel
            
            const res = await api.get(`/umh/v1/rooming/${selectedDeparture}`);
            setRooms(res.data.rooms);
            setUnassigned(res.data.unassigned);

            // Ekstrak Hotel Unik dari data Rooms (jika ada) atau fetch dari departure detail
            // Cara cepat: Ambil info hotel dari departure detail
            // Note: Idealnya endpoint /rooming/ mengembalikan meta data hotel jg. 
            // Workaround: Kita hardcode ambil dari API Departure list logic atau fetch single departure
            
            // Fetch Single Departure untuk dropdown Hotel di Modal
            api.get(`/umh/v1/departures`).then(allDeps => {
               const current = allDeps.data.find(d => d.id == selectedDeparture);
               if(current) {
                   // Disini kita perlu nama hotel dan ID nya. API list departure sudah join.
                   const hotelList = [];
                   if(current.hotel_makkah_name) hotelList.push({ id: current.hotel_makkah_id, name: `Makkah - ${current.hotel_makkah_name}` });
                   if(current.hotel_madinah_name) hotelList.push({ id: current.hotel_madinah_id, name: `Madinah - ${current.hotel_madinah_name}` });
                   setHotels(hotelList);
                   if(hotelList.length > 0) setNewRoom(prev => ({ ...prev, hotel_id: hotelList[0].id }));
               }
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- DRAG AND DROP HANDLERS ---
    
    const handleDragStart = (e, passengerId) => {
        e.dataTransfer.setData("passengerId", passengerId);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Wajib agar bisa drop
    };

    const handleDrop = async (e, roomId) => {
        e.preventDefault();
        const passengerId = e.dataTransfer.getData("passengerId");
        
        // Optimistic UI Update (Agar terasa cepat)
        const pId = parseInt(passengerId);
        
        // Cek dulu kapasitas (Optional, validasi di backend lebih aman)
        // Kirim Request
        try {
            await api.post('/umh/v1/rooming/assign', { passenger_id: pId, room_id: roomId });
            fetchRoomingData(); // Refresh data
        } catch (err) {
            alert("Gagal memindahkan jemaah");
        }
    };

    const handleUnassign = async (passengerId) => {
        if(!window.confirm("Keluarkan jemaah dari kamar?")) return;
        try {
            await api.post('/umh/v1/rooming/assign', { passenger_id: passengerId, room_id: null });
            fetchRoomingData();
        } catch (err) {
            alert("Gagal");
        }
    };

    // --- ROOM CRUD ---
    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/umh/v1/rooming/rooms', { ...newRoom, departure_id: selectedDeparture });
            setShowModal(false);
            fetchRoomingData();
            setNewRoom({ ...newRoom, room_number: '' }); // Reset nomor kamar
        } catch (err) {
            alert("Gagal buat kamar");
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if(!window.confirm("Hapus kamar ini? Jemaah di dalamnya akan menjadi 'Unassigned'.")) return;
        try {
            await api.delete(`/umh/v1/rooming/rooms/${roomId}`);
            fetchRoomingData();
        } catch (err) {
            alert("Gagal hapus kamar");
        }
    };

    // --- RENDERERS ---

    const renderGenderIcon = (gender) => (
        <span className={`text-xs font-bold px-1 rounded ${gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
            {gender}
        </span>
    );

    return (
        <Layout title="Rooming List (Pengaturan Kamar)">
            
            {/* HEADER: SELECT DEPARTURE */}
            <div className="bg-white p-4 rounded shadow mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-1/2">
                    <UserGroupIcon className="h-6 w-6 text-gray-500" />
                    <select 
                        className="w-full border p-2 rounded font-bold"
                        value={selectedDeparture}
                        onChange={(e) => setSelectedDeparture(e.target.value)}
                    >
                        <option value="">-- Pilih Keberangkatan --</option>
                        {departures.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.departure_date} - {d.package_name}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedDeparture && (
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
                    >
                        <PlusIcon className="h-5 w-5" /> Tambah Kamar
                    </button>
                )}
            </div>

            {selectedDeparture ? (
                <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
                    
                    {/* KOLOM KIRI: UNASSIGNED PASSENGERS */}
                    <div className="w-full md:w-1/4 bg-white rounded shadow flex flex-col">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Belum Dapat Kamar</h3>
                            <span className="bg-red-500 text-white px-2 rounded-full text-xs">{unassigned.length}</span>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-2 bg-gray-100">
                            {unassigned.map(pax => (
                                <div 
                                    key={pax.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, pax.id)}
                                    className="bg-white p-3 rounded border shadow-sm cursor-move hover:shadow-md border-l-4 border-l-gray-400"
                                >
                                    <div className="font-bold text-sm truncate">{pax.full_name}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        {renderGenderIcon(pax.gender)}
                                        <span className="text-xs text-gray-500">{pax.package_room_type}</span>
                                    </div>
                                </div>
                            ))}
                            {unassigned.length === 0 && (
                                <div className="text-center text-gray-400 text-sm mt-10">Semua jemaah sudah masuk kamar ✅</div>
                            )}
                        </div>
                    </div>

                    {/* KOLOM KANAN: ROOMS GRID */}
                    <div className="w-full md:w-3/4 overflow-y-auto">
                        {loading && <Spinner />}
                        
                        {/* Group by Hotel (Optional, for now just list) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rooms.map(room => {
                                const isFull = room.occupants.length >= room.capacity;
                                return (
                                    <div 
                                        key={room.id}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, room.id)}
                                        className={`bg-white rounded shadow border-t-4 flex flex-col ${isFull ? 'border-green-500' : 'border-blue-500'}`}
                                    >
                                        {/* Room Header */}
                                        <div className="p-3 border-b flex justify-between items-start bg-gray-50">
                                            <div>
                                                <div className="font-bold text-lg">Kamar {room.room_number}</div>
                                                <div className="text-xs text-gray-500">{room.hotel_name}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-bold px-2 py-0.5 rounded ${isFull ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {room.occupants.length} / {room.capacity}
                                                </div>
                                                <button onClick={() => handleDeleteRoom(room.id)} className="text-red-400 hover:text-red-600 mt-1">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Room Body (Occupants) */}
                                        <div className="p-3 flex-1 space-y-2 min-h-[100px]">
                                            {room.occupants.map(occ => (
                                                <div key={occ.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded border">
                                                    <div className="truncate w-3/4">
                                                        <span className="mr-2">{renderGenderIcon(occ.gender)}</span>
                                                        {occ.full_name}
                                                    </div>
                                                    <button onClick={() => handleUnassign(occ.id)} className="text-gray-400 hover:text-red-500">×</button>
                                                </div>
                                            ))}
                                            {room.occupants.length === 0 && (
                                                <div className="text-center text-xs text-gray-400 py-4 border-2 border-dashed rounded">
                                                    Tarik Jemaah ke Sini
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {rooms.length === 0 && !loading && (
                            <div className="text-center py-20 bg-white rounded shadow">
                                <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-600">Belum ada kamar dibuat</h3>
                                <p className="text-gray-500 mb-6">Silakan buat kamar hotel (Quad/Triple/Double) terlebih dahulu.</p>
                                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Buat Kamar Pertama</button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">Pilih Keberangkatan di atas untuk mulai mengatur Rooming List.</p>
                </div>
            )}

            {/* MODAL CREATE ROOM */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h3 className="font-bold text-lg mb-4">Tambah Kamar Baru</h3>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Hotel</label>
                                <select 
                                    className="w-full border p-2 rounded"
                                    value={newRoom.hotel_id}
                                    onChange={e => setNewRoom({...newRoom, hotel_id: e.target.value})}
                                    required
                                >
                                    <option value="">-- Pilih Hotel --</option>
                                    {hotels.map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nomor Kamar</label>
                                <input 
                                    className="w-full border p-2 rounded" 
                                    value={newRoom.room_number}
                                    onChange={e => setNewRoom({...newRoom, room_number: e.target.value})}
                                    placeholder="Contoh: 101"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kapasitas</label>
                                    <select 
                                        className="w-full border p-2 rounded"
                                        value={newRoom.capacity}
                                        onChange={e => setNewRoom({...newRoom, capacity: e.target.value})}
                                    >
                                        <option value="4">4 (Quad)</option>
                                        <option value="3">3 (Triple)</option>
                                        <option value="2">2 (Double)</option>
                                        <option value="1">1 (Single)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jenis</label>
                                    <select 
                                        className="w-full border p-2 rounded"
                                        value={newRoom.room_gender}
                                        onChange={e => setNewRoom({...newRoom, room_gender: e.target.value})}
                                    >
                                        <option value="family">Campur/Keluarga</option>
                                        <option value="male">Ikhwan (Laki)</option>
                                        <option value="female">Akhwat (Perempuan)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default RoomingList;