import React, { useState } from 'react';
import Modal from './Modal'; // Modal bileşenini ekle

function InvoiceLineItemForm({ show, handleClose, invoiceId, token, onItemAdded }) {
    const [itemData, setItemData] = useState({
        itemName: '',
        quantity: '',
        price: '',
        recordDate: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setItemData({ ...itemData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5225/api/invoiceline/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...itemData,
                    invoiceId: invoiceId
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Fatura kalemi eklenirken hata oluştu.');
            }

            alert('Fatura kalemi başarıyla eklendi!');
            setItemData({ itemName: '', quantity: '', price: '', recordDate: '' });
            handleClose();
            onItemAdded(invoiceId);

        } catch (err) {
            setError(err.message || 'Fatura kalemi eklenirken bir hata oluştu.');
        }
    };

    return (
        <Modal show={show} onClose={handleClose} title="Fatura Kalemi Ekle">
            <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                    <label className="form-label">Item Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="itemName"
                        value={itemData.itemName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={itemData.quantity}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={itemData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Record Date</label>
                    <input
                        type="date"
                        className="form-control"
                        name="recordDate"
                        value={itemData.recordDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleClose}>İptal</button>
                    <button type="submit" className="btn btn-success">Kaydet</button>
                </div>
            </form>
        </Modal>
    );
}

export default InvoiceLineItemForm;