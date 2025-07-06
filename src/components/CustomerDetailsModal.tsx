import React, { useState } from 'react';
import { XIcon, ZoomInIcon, UserIcon, PhoneIcon, MapPinIcon, BriefcaseIcon, FileIcon, PencilIcon, SaveIcon, LoaderIcon, CheckCircleIcon, AlertCircleIcon, UploadIcon } from 'lucide-react';
import { QueueCustomer, QueueApiResponse } from '../service/api/queue';
import { updateCustomer } from '../service/api/customer';
import {toast, Toaster} from "sonner";
interface CustomerDetailsModalProps {
  customer: QueueCustomer;
  isOpen: boolean;
  onClose: () => void;
  queueData?: QueueApiResponse;
}
const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  customer,
  isOpen,
  onClose,
  queueData
}) => {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const [editedCustomer, setEditedCustomer] = useState<QueueCustomer>(customer);
  if (!isOpen) return null;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setEditedCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'idFront' | 'idBack' | 'passportFront') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    setEditedCustomer(prev => ({
      ...prev,
      [type === 'idFront' ? 'idFrontImage' : type === 'idBack' ? 'idBackImage' : 'passportFrontImage']: fileUrl,
      [`${type}File`]: file
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const formData = new FormData();
      formData.append('fullName', editedCustomer.fullName);
      formData.append('dateOfBirth', editedCustomer.dateOfBirth);
      formData.append('idNumber', editedCustomer.idNumber);
      formData.append('address', editedCustomer.address);
      formData.append('city', editedCustomer.city);
      formData.append('postcode', editedCustomer.postcode);
      formData.append('state', editedCustomer.state);
      formData.append('country', editedCustomer.country);
      formData.append('phoneNumber', editedCustomer.phoneNumber);
      formData.append('residentStatus', editedCustomer.residentStatus);
      formData.append('orderPurpose', editedCustomer.orderPurpose);
      formData.append('occupation', editedCustomer.occupation || '');
      formData.append('natureOfBusiness', editedCustomer.natureOfBusiness || '');
      formData.append('nationality', editedCustomer.nationality || '');

      if ('idFrontFile' in editedCustomer && editedCustomer.idFrontFile instanceof File) {
        formData.append('idFrontImage', editedCustomer.idFrontFile);
      }
      if ('idBackFile' in editedCustomer && editedCustomer.idBackFile instanceof File) {
        formData.append('idBackImage', editedCustomer.idBackFile);
      }
      if ('passportFrontFile' in editedCustomer && editedCustomer.passportFrontFile instanceof File) {
        formData.append('passportFrontImage', editedCustomer.passportFrontFile);
      }

      await updateCustomer(customer.customerId, formData);

      toast.success("Customer information saved successfully!");

      setSaveStatus('success');
      setTimeout(() => {
        setIsEditing(false);
        setSaveStatus(null);
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save customer information.");
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const getTierDetails = (queueName: string) => {
    switch (queueName) {
      case 'Basic Tier':
        return {
          tier: 1,
          color: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'Standard Tier':
        return {
          tier: 2,
          color: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'Premium Tier':
        return {
          tier: 3,
          color: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      default:
        return {
          tier: 1,
          color: 'bg-blue-50 text-blue-700 border-blue-200'
        };
    }
  };
  const renderTierBadge = () => {
    if (!queueData?.queueTypeId) return null;
    const {
      tier,
      color
    } = getTierDetails(queueData.queueTypeId);
    const tiers = [{
      level: 1,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    }, {
      level: 2,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }, {
      level: 3,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    }];
    return <div className={`border rounded-lg p-4 ${color}`}>
        <div className="flex items-center justify-between">
        {/*  <div>
            <p className="text-sm font-medium">Selected Tier</p>
            <h4 className="text-lg font-semibold mt-1">
              {queueData.queueTypeId.queueName}
            </h4>
            <p className="text-sm mt-1 opacity-75">
              {queueData.queueTypeId.description}
            </p>
          </div>*/}
        {/*  <LayersIcon className="h-8 w-8 opacity-75" />*/}
        </div>
        {/*<div className="mt-3 flex gap-1">
          {tiers.map(t => <div key={t.level} className={`h-2 flex-1 rounded-full ${t.level <= tier ? color : 'bg-gray-100'}`} />)}
        </div>*/}
      </div>;
  };
  const renderField = (label: string, name: keyof QueueCustomer, value: string | null) => {
    // Show all fields when editing, but hide empty ones when viewing
    if (!isEditing && !value) return null;
    return <div className="mb-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label}
        </label>
        {isEditing ? <input type="text" name={name} value={value || ''} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" /> : <p className="text-sm text-gray-900">{value}</p>}
      </div>;
  };
  [customer.idFrontImage && {
    url: customer.idFrontImage,
    title: 'ID Front'
  }, customer.idBackImage && {
    url: customer.idBackImage,
    title: 'ID Back'
  }, customer.passportFrontImage && {
    url: customer.passportFrontImage,
    title: 'Passport Front'
  }].filter(Boolean);
  const sections = [{
    id: 'personal',
    title: 'Personal Info',
    icon: <UserIcon className="w-4 h-4" />
  }, {
    id: 'contact',
    title: 'Contact',
    icon: <PhoneIcon className="w-4 h-4" />
  }, {
    id: 'address',
    title: 'Address',
    icon: <MapPinIcon className="w-4 h-4" />
  }, {
    id: 'business',
    title: 'Business',
    icon: <BriefcaseIcon className="w-4 h-4" />
  }, {
    id: 'documents',
    title: 'Documents',
    icon: <FileIcon className="w-4 h-4" />
  }];
  const renderDocumentUpload = (label: string, image: string | null, type: 'idFront' | 'idBack' | 'passportFront') => {
    if (!isEditing && !image) return null;
    return <div className="group relative bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors">
        {image ? <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
            <img src={image} alt={label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            {isEditing && <button onClick={() => setEditedCustomer(prev => ({
          ...prev,
          [type === 'idFront' ? 'idFrontImage' : type === 'idBack' ? 'idBackImage' : 'passportFrontImage']: null,
          [`${type}File`]: null
        }))} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                <XIcon className="h-4 w-4" />
              </button>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setSelectedImage({
            url: image,
            title: label
          })} className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <ZoomInIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div> : isEditing ? <div className="aspect-[3/2] border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
            <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">Upload {label}</p>
            <input type="file" onChange={e => handleFileChange(e, type)} accept="image/*" className="hidden" id={`${type}-upload`} />
            <label htmlFor={`${type}-upload`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm">
              Select File
            </label>
          </div> : null}
        <span className="block mt-2 text-sm font-medium text-gray-700">
          {label}
        </span>
      </div>;
  };
  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Full Name', 'fullName', editedCustomer.fullName)}
            {renderField('IC/Passport Number', 'idNumber', editedCustomer.idNumber)}
            {renderField('Date of Birth', 'dateOfBirth', editedCustomer.dateOfBirth)}
            {renderField('Nationality', 'nationality', editedCustomer.nationality)}
            {renderField('Resident Status', 'residentStatus', editedCustomer.residentStatus)}
          </div>;
      case 'contact':
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Phone Number', 'phoneNumber', editedCustomer.phoneNumber)}
          </div>;
      case 'address':
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Address', 'address', editedCustomer.address)}
            {renderField('City', 'city', editedCustomer.city)}
            {renderField('Postcode', 'postcode', editedCustomer.postcode)}
            {renderField('State', 'state', editedCustomer.state)}
            {renderField('Country', 'country', editedCustomer.country)}
          </div>;
      case 'business':
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Always show these fields even if empty */}
      <div className="mb-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Occupation
        </label>
        {isEditing ? <input type="text" name="occupation" value={editedCustomer.occupation || ''} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" /> : <p className="text-sm text-gray-900">
            {editedCustomer.occupation || 'Not specified'}
          </p>}
      </div>
      <div className="mb-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Nature of Business
        </label>
        {isEditing ? <input type="text" name="natureOfBusiness" value={editedCustomer.natureOfBusiness || ''} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" /> : <p className="text-sm text-gray-900">
            {editedCustomer.natureOfBusiness || 'Not specified'}
          </p>}
      </div>
      {renderField('Order Purpose', 'orderPurpose', editedCustomer.orderPurpose)}
    </div>;
      case 'documents':
        return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {renderDocumentUpload('ID Front', editedCustomer.idFrontImage, 'idFront')}
            {renderDocumentUpload('ID Back', editedCustomer.idBackImage, 'idBack')}
            {renderDocumentUpload('Passport Front', editedCustomer.passportFrontImage, 'passportFront')}
          </div>;
      default:
        return null;
    }
  };
  const handlePrintImages = () => {
    const images = [{
      url: customer.idFrontImage,
      title: 'ID Front'
    }, {
      url: customer.idBackImage,
      title: 'ID Back'
    }, {
      url: customer.passportFrontImage,
      title: 'Passport Front'
    }].filter(img => img.url); // Only include images that exist
    if (images.length === 0) {
      alert('No identification images available to print');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const styles = `
      body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
      .image-container { margin-bottom: 30px; page-break-inside: avoid; }
      .image-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
      img { max-width: 100%; height: auto; border: 1px solid #ccc; }
      @media print {
        .no-print { display: none; }
      }
    `;
    const html = `
      <html>
        <head>
          <title>Customer ID Images - ${customer.fullName}</title>
          <style>{`;
    $;
    {
      styles;
    }
    ;
    `}</style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">
              Print Images
            </button>
          </div>
          <h1 style="margin-bottom: 20px;">ID Images - ${customer.fullName}</h1>
          ${images.map(img => `
            <div class="image-container">
              <div class="image-title">${img.title}</div>
              <img src="${img.url}" alt="${img.title}" />
            </div>
          `).join('')}
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };
  return<>
    <Toaster position="top-right" richColors />
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl mx-4 shadow-2xl relative max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <h3 className="text-xl font-semibold text-gray-900">
            Customer Details
          </h3>
          <div className="flex items-center gap-2">
            {!isEditing && <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors">
              <PencilIcon className="h-5 w-5" />
            </button>}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Status Message */}
        {saveStatus && <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center ${saveStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveStatus === 'success' ? <CheckCircleIcon className="h-5 w-5 mr-2" /> : <AlertCircleIcon className="h-5 w-5 mr-2" />}
          {saveStatus === 'success' ? 'Changes saved successfully' : 'Failed to save changes. Please try again.'}
        </div>}
        {/* Tier Badge */}
        <div className="px-6 pt-6">{renderTierBadge()}</div>
        {/* Navigation */}
        <div className="border-b overflow-x-auto">
          <div className="flex px-6">
            {sections.map(section => <button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex items-center px-4 py-3 border-b-2 text-sm font-medium transition-colors ${activeSection === section.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <span className="mr-2">{section.icon}</span>
              {section.title}
            </button>)}
          </div>
        </div>
        {/* Content */}
        <div className="p-6 overflow-y-auto">{renderContent()}</div>
        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          {isEditing ? <div className="flex gap-2">
            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              {isSaving ? <>
                <LoaderIcon className="animate-spin h-4 w-4 mr-2" />
                Saving...
              </> : <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Changes
              </>}
            </button>
            <button onClick={() => {
              setIsEditing(false);
              setEditedCustomer(customer);
            }} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div> : <div className="flex gap-2">
            <button onClick={handlePrintImages} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Print ID Images
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>}
        </div>
      </div>
      {/* Full-size Image Modal */}
      {selectedImage && <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <XIcon className="h-6 w-6" />
          </button>
          <img src={selectedImage.url} alt={selectedImage.title} className="max-w-full max-h-full object-contain" />
        </div>
      </div>}
    </div>;
  </>

};
export default CustomerDetailsModal;