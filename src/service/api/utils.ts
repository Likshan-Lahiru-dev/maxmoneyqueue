export const formatQueueNumber = (queueNumber: string | null): string => {
  if (!queueNumber) return '-';
  // Split by hyphen and get the last part
  const parts = queueNumber.split('-');
  if (parts.length < 2) return queueNumber;
  // Get the last part (sequence number) and pad with zeros if needed
  const sequenceNumber = parts[parts.length - 1];
  return sequenceNumber.padStart(4, '0');
};