import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'

export default function FaqModal({ isOpen, setIsOpen }) {

  function close() {
    setIsOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={close}>
        <div className="fixed inset-0 z-50 w-screen overflow-y-auto bg-black/50" aria-hidden="true" >
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/80 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle as="h3" className="text-base/7 font-medium ">
                FAQ Details
              </DialogTitle>
              <p className="mt-2 text-sm/6 space-y-5">
                <div>
                  <span className="font-semibold ">Question:</span> What is the purpose of this venue?
                </div>
                <div>
                  <span className="font-semibold ">Answer:</span> This venue is designed to host various events and gatherings, providing a space for community engagement and entertainment.
                </div>
              </p>
              <div className="flex gap-4 mt-4">
                <Button
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                  onClick={close}
                >
                  Close
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog >
    </>
  )
}