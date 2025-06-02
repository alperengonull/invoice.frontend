import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { useParams, useNavigate } from 'react-router-dom';
import InvoiceLineItemForm from '../components/InvoiceLineItemForm';
import InvoiceLineItemList from '../components/InvoiceLineItemList';

function CustomerInvoices() {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [customer, setCustomer] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [showItemForm, setShowItemForm] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [showItems, setShowItems] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {

                const customerRes = await fetch(`http://localhost:5225/api/customer/${customerId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!customerRes.ok) throw new Error('Müşteri bilgileri alınamadı');
                const customerData = await customerRes.json();
                setCustomer(customerData);


                const invoicesRes = await fetch(`http://localhost:5225/api/invoice/list/${customerId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!invoicesRes.ok) throw new Error('Faturalar alınamadı');
                const invoicesData = await invoicesRes.json();


                setInvoices(invoicesData.map(invoice => ({
                    id: invoice.invoiceId || invoice.InvoiceId, // Backend'den gelen property ismi
                    invoiceNumber: invoice.invoiceNumber || invoice.InvoiceNumber,
                    date: invoice.invoiceDate || invoice.InvoiceDate,
                    totalAmount: invoice.totalAmount || 0
                })));

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [customerId, token, navigate]);

    const handleDelete = async (invoiceId) => {
        if (!window.confirm('Bu faturayı silmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch(`http://localhost:5225/api/invoice/delete/${invoiceId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Silme işlemi başarısız');

            setInvoices(invoices.filter(i => i.id !== invoiceId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5225/api/invoice/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    InvoiceId: editingInvoice.id,
                    InvoiceNumber: editingInvoice.invoiceNumber,
                    InvoiceDate: editingInvoice.date,
                    TotalAmount: editingInvoice.totalAmount,
                    CustomerId: customerId
                })
            });

            if (!response.ok) throw new Error('Güncelleme başarısız');

            setInvoices(invoices.map(i =>
                i.id === editingInvoice.id ? editingInvoice : i
            ));
            setEditingInvoice(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddItemClick = (invoiceId) => {
        setSelectedInvoiceId(invoiceId);
        setShowItemForm(true);
    };


    const handleItemAdded = async (invoiceId) => {
        try {

            const itemsResponse = await fetch(
                `http://localhost:5225/api/invoiceline/by-invoice/${invoiceId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (!itemsResponse.ok) throw new Error('Fatura kalemleri alınamadı');
            const items = await itemsResponse.json();


            const newTotal = items.reduce((sum, item) => {
                return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
            }, 0);


            const updateResponse = await fetch(
                `http://localhost:5225/api/invoice/update-total/${invoiceId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        newTotalAmount: newTotal  // Yeni Toplam Tutar
                    }),
                }
            );

            if (!updateResponse.ok) {
                throw new Error('Toplam tutar güncellenemedi');
            }

            // 4. UI'ı güncelle
            setInvoices(prevInvoices =>
                prevInvoices.map(invoice =>
                    invoice.id === invoiceId
                        ? { ...invoice, totalAmount: newTotal }
                        : invoice
                )
            );

        } catch (err) {
            console.error("Fatura güncellenirken hata:", err);
            setError(err.message || 'Toplam tutar güncellenemedi');
        }
    };

    const handleViewItems = async (invoiceId) => {
        try {

            const itemsResponse = await fetch(
                `http://localhost:5225/api/invoiceline/by-invoice/${invoiceId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (!itemsResponse.ok) {
                throw new Error('Fatura kalemleri alınamadı');
            }

            const items = await itemsResponse.json();
            setInvoiceItems(items);
            setShowItems(true);


            const calculatedTotal = items.reduce((sum, item) => {
                return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
            }, 0);


            const invoiceResponse = await fetch(
                `http://localhost:5225/api/invoice/${invoiceId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            console.log("İstek atılan URL:", `http://localhost:5225/api/invoice/${invoiceId}`);

            if (invoiceResponse.ok) {
                const invoice = await invoiceResponse.json();
                const invoiceTotal = parseFloat(invoice.totalAmount) || 0;


                if (Math.abs(invoiceTotal - calculatedTotal) > 0.01) {
                    console.log(`Tutar farkı tespit edildi: DB=${invoiceTotal}, Hesaplanan=${calculatedTotal}`);

                    setError(`Uyarı: Fatura tutarı (${invoiceTotal}) ile kalemlerin toplamı (${calculatedTotal}) uyuşmuyor. Lütfen kontrol edin.`);
                }
            }
        } catch (err) {
            console.error("Fatura kalemleri alınırken hata:", err);
            setError(err.message || 'Fatura kalemleri alınamadı');
        }
    };

    // Luxon ile tarih formatlama fonksiyonu
    const formatDateWithLuxon = (dateString) => {
        if (!dateString) return 'Tarih Yok';

        try {
            // ISO formatına göre parse et
            const dt = DateTime.fromISO(dateString);

            // Geçerli bir tarih mi kontrol et
            if (!dt.isValid) {
                console.warn('Geçersiz tarih:', dateString);
                return 'Geçersiz Tarih';
            }

            // Türkçe format: dd.MM.yyyy (01.01.2023)
            return dt.toFormat('dd.MM.yyyy');
        } catch (error) {
            console.error('Tarih formatlama hatası:', error);
            return dateString; // Orjinal değeri döndür
        }
    };


    if (loading) return <div className="container mt-5">Yükleniyor...</div>;
    if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
                Geri Dön
            </button>

            <h2>{customer?.Title || customer?.title} Faturaları</h2>

            {invoices.length === 0 ? (
                <div className="alert alert-info">Fatura bulunamadı</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Fatura No</th>
                                <th>Tutar</th>
                                <th>Tarih</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(invoice => (
                                <tr key={invoice.id}>
                                    <td>{invoice.invoiceNumber}</td>
                                    <td>{invoice.totalAmount} TL</td>
                                    {/* Luxon ile tarih formatlama */}
                                    <td>{formatDateWithLuxon(invoice.date)}</td>

                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={() => handleViewItems(invoice.id)}
                                        >
                                            Detay Görüntüle
                                        </button>
                                        <button
                                            className="btn btn-sm btn-success me-2"
                                            onClick={() => handleAddItemClick(invoice.id)}
                                        >
                                            Fatura Kalemi Ekle
                                        </button>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => setEditingInvoice(invoice)}
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(invoice.id)}
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editingInvoice && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Fatura Düzenle</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setEditingInvoice(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdate}>
                                    <div className="mb-3">
                                        <label className="form-label">Fatura No</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editingInvoice.invoiceNumber}
                                            onChange={(e) => setEditingInvoice({
                                                ...editingInvoice,
                                                invoiceNumber: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    {/* <div className="mb-3">
                                        <label className="form-label">Tutar</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editingInvoice.totalAmount}
                                            onChange={(e) => setEditingInvoice({
                                                ...editingInvoice,
                                                totalAmount: e.target.value
                                            })}
                                            required
                                        />
                                    </div> */}
                                    <div className="mb-3">
                                        <label className="form-label">Tarih</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={DateTime.fromISO(editingInvoice.date).toISODate()}
                                            onChange={(e) => setEditingInvoice({
                                                ...editingInvoice,
                                                date: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setEditingInvoice(null)}
                                        >
                                            İptal
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Kaydet
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <InvoiceLineItemForm
                show={showItemForm}
                handleClose={() => setShowItemForm(false)}
                invoiceId={selectedInvoiceId}
                token={token}
                onItemAdded={handleItemAdded}
            />

            {showItems && (
                <InvoiceLineItemList
                    items={invoiceItems}
                    onClose={() => setShowItems(false)}
                    token={token}
                    onItemDeleted={(deletedItemId) => {
                        setInvoiceItems(prevItems => prevItems.filter(item =>
                            item.invoiceLineId !== deletedItemId && item.id !== deletedItemId
                        ));
                        // Toplam tutarı yeniden hesapla ve güncelle
                        handleItemAdded(selectedInvoiceId);
                    }}
                />
            )}

        </div>
    );
}

export default CustomerInvoices;