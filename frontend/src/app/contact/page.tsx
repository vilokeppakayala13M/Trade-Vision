"use client";

import React, { useState } from 'react';
import styles from './page.module.css';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
            } else {
                setStatus('error');
                setErrorMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setStatus('error');
            setErrorMessage('Network error. Please try again later.');
        }
    };

    return (
        <div className={styles.contactContainer}>
            <h1 className={styles.title}>Contact Support</h1>
            <p className={styles.subtitle}>Have a question or grievance? We're here to help.</p>

            {status === 'success' && (
                <div className={styles.successMessage}>
                    Your message has been sent successfully. We will get back to you soon!
                </div>
            )}

            {status === 'error' && (
                <div className={styles.errorMessage}>
                    {errorMessage}
                </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        required 
                        className={styles.input}
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required 
                        className={styles.input}
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject</label>
                    <select 
                        id="subject" 
                        name="subject" 
                        className={styles.select}
                        value={formData.subject}
                        onChange={handleChange}
                    >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Technical Issue">Technical Issue</option>
                        <option value="Data Grievance">Data Grievance</option>
                        <option value="Account Deletion Request">Account Deletion Request</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="message">Message</label>
                    <textarea 
                        id="message" 
                        name="message" 
                        required 
                        className={styles.textarea}
                        value={formData.message}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    );
}
