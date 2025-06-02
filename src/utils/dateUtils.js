import { DateTime } from 'luxon';

export const formatDate = (dateString) => {
    if (!dateString) return 'Tarih Yok';
    const dt = DateTime.fromISO(dateString);
    return dt.isValid ? dt.toFormat('dd.MM.yyyy') : dateString;
};