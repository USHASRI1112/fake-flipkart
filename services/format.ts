export function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatOrderDate(date = new Date()) {
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

