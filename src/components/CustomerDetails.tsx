import React from 'react';
import CustomerDetailsModal from './CustomerDetailsModal';
import { QueueCustomer } from '../service/api/queue';
interface CustomerDetailsProps {
  customerData: QueueCustomer;
}
const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customerData
}) => {
  return <CustomerDetailsModal customer={customerData} isOpen={true} onClose={() => {}} />;
};
export default CustomerDetails;