import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';

export default function AddVenue({ isOpen, setIsOpen }) {
  const [formData, setFormData] = useState({
    venueName: '',
    state: '',
    city: '',
    address: '',
    venueType: '',
    venueDescription: '',
    venueHours: '',
    tables: '',
  });

  const [errors, setErrors] = useState({});

  function close() {
    setIsOpen(false);
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.venueName.trim()) newErrors.venueName = 'Venue Name is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.venueType.trim()) newErrors.venueType = 'Venue Type is required';
    if (!formData.venueDescription.trim()) newErrors.venueDescription = 'Venue Description is required';
    if (!formData.venueHours.trim()) newErrors.venueHours = 'Venue Hours are required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      console.log('Form Data:', formData);
      setErrors({});
      close();
    }
  };

  return (
    <>
      <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={close}>
        <div className="fixed inset-0 z-50 w-screen overflow-y-auto bg-black/50" aria-hidden="true">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-primary/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 shadow-2xl shadow-black/50"
            >
              <DialogTitle as="h3" className="text-base/7 font-medium text-white">
                Add Job
              </DialogTitle>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="relative z-0">
                  <input
                    type="text"
                    id="venueName"
                    value={formData.venueName}
                    onChange={handleChange}
                    className="block py-2.5 px-0 w-full text-sm text-septenary bg-transparent border-0 border-b-2 border-quinary appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="venueName"
                    className="absolute text-sm text-gray-100  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Job Name
                  </label>
                  {errors.venueName && <p className="text-red-500 text-xs mt-1">{errors.venueName}</p>}
                </div>
                <div className="relative z-0">
                  <input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="block py-2.5 px-0 w-full text-sm text-septenary bg-transparent border-0 border-b-2 border-quinary appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="state"
                    className="absolute text-sm text-gray-100  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Job # (Optional)
                  </label>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                <div className="relative z-0">
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="block py-2.5 px-0 w-full text-sm text-septenary bg-transparent border-0 border-b-2 border-quinary appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="city"
                    className="absolute text-sm text-gray-100  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Job Location
                  </label>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div className="relative z-0">
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="block py-2.5 px-0 w-full text-sm text-septenary bg-transparent border-0 border-b-2 border-quinary appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="address"
                    className="absolute text-sm text-gray-100  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Job type
                  </label>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="relative z-0">
                  <textarea
                    id="venueDescription"
                    value={formData.venueDescription}
                    onChange={handleChange}
                    className="block py-2.5 px-0 w-full text-sm text-septenary bg-transparent border-0 border-b-2 border-quinary appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                    placeholder=" "
                  ></textarea>
                  <label
                    htmlFor="venueDescription"
                    className="absolute text-sm text-gray-100  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Job Note
                  </label>
                  {errors.venueDescription && <p className="text-red-500 text-xs mt-1">{errors.venueDescription}</p>}
                </div>
                <div className="relative z-0">
                  <input
                    type="text"
                    id="venueHours"
                    value={formData.venueHours}
                    onChange={handleChange}
                    className="block py-2.5 px-0 w-full text-sm text-septenary bg-transparent border-0 border-b-2 border-quinary appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="venueHours"
                    className="absolute text-sm text-gray-100  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Job Hours
                  </label>
                  {errors.venueHours && <p className="text-red-500 text-xs mt-1">{errors.venueHours}</p>}
                </div>
                <div className="relative z-0">
                  <input
                    type="text"
                    id="venueHours"
                    // value={formData.venueHours}
                    // onChange={handleChange}
                    className="block py-2.5 px-0 w-full text-sm text-septenary bg-transparent border-0 border-b-2 border-quinary appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="venueHours"
                    className="absolute text-sm text-gray-100  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    materials cost
                  </label>
                  {/* {errors.venueHours && <p className="text-red-500 text-xs mt-1">{errors.venueHours}</p>} */}
                </div>
                <div className="relative z-0">
                  <input
                    type="text"
                    id="venueHours"
                    // value={formData.venueHours}
                    // onChange={handleChange}
                    className="block py-2.5 px-0 w-full text-sm text-septenary bg-transparent border-0 border-b-2 border-quinary appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="venueHours"
                    className="absolute text-sm text-gray-100  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    labour cost
                  </label>
                  {/* {errors.venueHours && <p className="text-red-500 text-xs mt-1">{errors.venueHours}</p>} */}
                </div>
                <div className="relative z-0">
                  <input
                    type="text"
                    id="tables"
                    value={formData.tables}
                    onChange={handleChange}
                    className="block py-2.5 px-0 w-full text-sm text-septenary bg-transparent border-0 border-b-2 border-quinary appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="tables"
                    className="absolute text-sm text-gray-100  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Milestones
                  </label>
                </div>
                <div className='flex justify-end'>
                  <button className='text-sm bg-primary text-white px-3 py-1.5 rounded-full'>Add Milestones</button>
                </div>
                <div className="flex gap-4 mt-4">
                  <Button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                  >
                    Submit
                  </Button>
                  <Button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md bg-gray-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                    onClick={close}
                  >
                    Close
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}