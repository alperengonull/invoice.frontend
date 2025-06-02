import React, { useState, useEffect } from 'react';


function InvoiceForm({ show, handleClose, customer, token, onInvoiceAdded }) {
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: '',
        TotalAmount: '0', // Default 0 ayarlıyoruz ki Fatura kalemi eklendiğinde burayı updateleyelim.
        invoiceDate: '',
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        // setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
        const { name, value } = e.target;
        if (name === "invoiceDate") {
            setInvoiceData({ ...invoiceData, [name]: value });
        } else {
            setInvoiceData({ ...invoiceData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!customer?.customerId) {
            setError('Geçerli müşteri bilgisi bulunamadı!');
            return;
        }

        try {
            const response = await fetch('http://localhost:5225/api/invoice/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...invoiceData,
                    customerId: customer.customerId, // customer.id yerine customer.customerId
                }),
            });

            if (response.status === 401) {
                setError('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Fatura eklenirken hata oluştu.');
            }

            alert('Fatura başarıyla eklendi!');
            setInvoiceData({ invoiceNumber: '', TotalAmount: '', invoiceDate: '' });
            onInvoiceAdded();
            handleClose();

        } catch (err) {
            setError(err.message || 'Fatura eklenirken bir hata oluştu.');
        }
    };

    useEffect(() => {
        const modal = document.getElementById('invoiceModal');
        if (show) {
            const bsModal = new window.bootstrap.Modal(modal);
            bsModal.show();
        } else {
            const bsModal = window.bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        }
    }, [show]);

    return (
        <div className="modal fade" id="invoiceModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">{customer?.title} için Fatura Ekle</h5>
                            <button type="button" className="btn-close" onClick={handleClose}></button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}

                            {/* Müşteri ID'si - Değiştirilemez alan */}
                            <div className="mb-3">
                                <label className="form-label">Müşteri ID</label>
                                <input
                                    type="text"
                                    className="form-control bg-light"
                                    value={customer?.customerId || ''} // customer.id yerine customer.customerId
                                    readOnly
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="invoiceNumber" className="form-label">Fatura Numarası</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="invoiceNumber"
                                    name="invoiceNumber"
                                    value={invoiceData.invoiceNumber}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="TotalAmount" className="form-label">Tutar</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="TotalAmount"
                                    name="TotalAmount"
                                    value={invoiceData.TotalAmount}
                                    onChange={handleInputChange}
                                    readOnly
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="date" className="form-label">Tarih</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="invoiceDate"
                                    name="invoiceDate"
                                    value={invoiceData.invoiceDate || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>İptal</button>
                            <button type="submit" className="btn btn-success">Kaydet</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default InvoiceForm;