import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:5225/api/Auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Giriş başarısız.');
            }

            const data = await response.json();
            // JWT token'ı localStorage'a kaydet
            localStorage.setItem('token', data.token);

            setSuccess('Giriş başarılı! Anasayfaya yönlendiriliyorsunuz...');
            setTimeout(() => {
                navigate('/home', { state: { username: formData.username } });
            }, 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h3 className="text-center mb-4">Giriş Yap</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Kullanıcı Adı</label>
                        <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Şifre</label>
                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-danger w-100">Giriş Yap</button>
                </form>
                <div className="text-center mt-3">
                    <small>Hesabınız yok mu?{' '}
                        <button
                            className="btn btn-link p-0"
                            onClick={() => navigate('/')}
                        >
                            Kayıt Ol
                        </button>
                    </small>
                </div>
            </div>
        </div>
    );
}

export default Login;
