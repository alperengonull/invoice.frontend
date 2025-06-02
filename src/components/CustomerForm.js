import React, { useState } from 'react';

function CustomerForm({ token, onAddCustomer, onCancel }) {
  const [customerData, setCustomerData] = useState({
    taxNumber: '',
    title: '',
    address: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!customerData.taxNumber || !customerData.title) {
      setError('Tax Number ve Title alanları zorunludur.');
      return;
    }

    try {
      await onAddCustomer(customerData);
      setMessage('Müşteri başarıyla eklendi!');
      setCustomerData({ taxNumber: '', title: '', address: '', email: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light">
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="mb-3">
        <label className="form-label">Tax Number</label>
        <input
          type="text"
          className="form-control"
          name="taxNumber"
          value={customerData.taxNumber}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          name="title"
          value={customerData.title}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Address</label>
        <input
          type="text"
          className="form-control"
          name="address"
          value={customerData.address}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          name="email"
          value={customerData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-success flex-grow-1">
          Ekle
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          İptal
        </button>
      </div>
    </form>
  );
}

export default CustomerForm;
