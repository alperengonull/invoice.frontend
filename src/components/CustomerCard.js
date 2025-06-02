import React from 'react';
import { useNavigate } from 'react-router-dom';

function CustomerCard({ customer, onAddInvoice }) {
    const navigate = useNavigate();

    return (
        <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
                <div className="card-body">
                    <h5 className="card-title">{customer.title}</h5>
                    <p className="card-text">
                        <strong>Vergi No:</strong> {customer.taxNumber}
                    </p>
                    <p className="card-text">
                        <strong>Email:</strong> {customer.email || '-'}
                    </p>
                    <p className="card-text"><strong>Adres:</strong> {customer.address}</p>
                    <div className="d-flex mt-3">
                        <button
                            className="btn btn-danger me-2"
                            onClick={() => onAddInvoice(customer)}
                        >
                            Fatura Ekle
                        </button>
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => navigate(`/customer/${customer.customerId}/invoices`, {
                                state: { customer }
                            })}
                        >
                            Faturaları Gör
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerCard;