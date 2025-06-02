import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import CustomerForm from '../components/CustomerForm';
import CustomerCard from '../components/CustomerCard';
import InvoiceForm from '../components/InvoiceForm';

function Home() {
    const location = useLocation();
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const username = location.state?.username || '';

    const [showForm, setShowForm] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [error, setError] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    const handleAddInvoiceClick = (customer) => {
        setSelectedCustomer(customer);
        setShowInvoiceModal(true);
    };

    const handleInvoiceFormClose = () => {
        setShowInvoiceModal(false);
        setSelectedCustomer(null);
    };

    const handleInvoiceAdded = () => {
        console.log('Fatura eklendi, gerekirse liste güncellenir');
    };

    useEffect(() => {
        if (!token || !username) {
            navigate('/login');
        }
    }, [token, username, navigate]);

    const fetchCustomers = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:5225/api/customer/list', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Müşteri listesi alınamadı.');
            }

            setCustomerList(data);
        } catch (err) {
            console.error("Müşteri listesi alınamadı", err);
            setError(err.message);
        }
    }, [token, navigate]);

    useEffect(() => {
        if (token && username) {
            fetchCustomers();
        }
    }, [token, username, fetchCustomers]);

    const handleAddCustomer = async (customerData) => {
        setError('');
        try {
            const response = await fetch('http://localhost:5225/api/customer/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(customerData),
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const contentType = response.headers.get('content-type');
            let data = null;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Beklenmeyen yanıt: ${text}`);
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Müşteri eklenirken hata oluştu.');
            }

            // Müşteri ID'sini console'a yazdır
            // console.log('Oluşturulan müşteri ID:', data.id);
            console.log('Oluşturulan müşteri ID:', data.customerId);

            fetchCustomers();
            setShowForm(false);
        } catch (err) {
            console.error("Hata:", err);
            setError(err.message);
            throw err; // CustomerForm'da gösterilsin diye
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Hoşgeldiniz, {username}!</h2>
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                    Çıkış Yap
                </button>
            </div>

            <button
                className="btn btn-danger my-3"
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'İptal' : 'Müşteri Ekle'}
            </button>

            {showForm && (
                <CustomerForm
                    token={token}
                    onAddCustomer={handleAddCustomer}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row mt-5">
                {customerList.map((customer, index) => (
                    <CustomerCard
                        key={index}
                        customer={customer}
                        onAddInvoice={handleAddInvoiceClick}
                    />
                ))}
            </div>

            <InvoiceForm
                show={showInvoiceModal}
                handleClose={handleInvoiceFormClose}
                customer={selectedCustomer}
                token={token}
                onInvoiceAdded={handleInvoiceAdded}
            />
        </div>
    );
}

export default Home;