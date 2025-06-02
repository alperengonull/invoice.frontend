import React from 'react';
import { formatDate } from '../utils/dateUtils';
import Modal from './Modal';

function InvoiceLineItemList({ items, onClose, token, onItemDeleted }) {

    const handleDelete = async (itemId) => {
        if (!window.confirm('Bu fatura kalemini silmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch(`http://localhost:5225/api/invoiceline/delete/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Silme işlemi başarısız');
            }

            // listeyi güncelle
            onItemDeleted(itemId);
        } catch (err) {
            console.error("Fatura kalemi silinirken hata:", err);
            alert(err.message || 'Fatura kalemi silinirken bir hata oluştu');
        }
    };

    return (
        <Modal show={true} onClose={onClose} title="Fatura Kalemleri">
            {items.length === 0 ? (
                <div className="alert alert-info">Fatura kalemi bulunamadı</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Record Date</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.itemName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price} TL</td>
                                    <td>{formatDate(item.recordDate)}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(item.invoiceLineId || item.id)}
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
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Kapat</button>
            </div>
        </Modal>
    );
}

export default InvoiceLineItemList;