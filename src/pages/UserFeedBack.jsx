import React, { useState } from 'react'
import Header from '../components/partials/header';
// import UserFeedBackView from '../components/UserFeedbackView';

export default function UserFeedBack() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Header header={"User Feedback"} />
      <div className="max-w-screen-2xl mx-auto">
        <div className="mx-4 sm:mx-9 my-3">
          <div className="flex flex-wrap gap-4 justify-between bg-white text-gray-700 px-4 py-2">
            <div className="max-w-xs w-full">
              {/* <button className="rounded-md w-full sm:w-auto bg-orange-150 text-white px-6 py-2 text-lg font-medium capitalize">Add category</button> */}
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                </div>
                <input
                  type="search"
                  id="default-search"
                  className="block w-full px-4 py-2 outline-none pl-10 text-sm text-gray-700 border border-black rounded-full focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search feedbacks..."
                  required
                />
              </div>
            </div>
            <div className="flex flex-col w-full sm:w-auto sm:flex-row sm:items-center gap-4">
              <button className=" px-5 py-2 border border-black text-xs rounded-md font-medium">Download.csv</button>
              {/* <Filterdropdown /> */}
            </div>
          </div>
          <div className="my-3">
            <div className="relative overflow-x-auto drop-shadow-xl bg-white sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase  border-b-2 border-quinary  bg-white">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Username
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Number Of Stars
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Feedback
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      time
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(7)].map((x, i) => (
                    <tr className=" border-b-2 border-quinary hover:bg-primary/10 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        John Doe
                      </td>
                      <td className="px-6 py-4">
                        3
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        Don't feel like using this app
                      </td>
                      <td className="px-6 py-4">
                        02/02/2023
                      </td>
                      <td className="px-6 py-4">
                        2:40pm
                      </td>
                      <td className="px-6 py-4">
                        <button type='button' onClick={e => setIsOpen(true)} className="font-medium cursor-pointer text-white bg-primary/40 px-3 py-0.5 rounded-md">view</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* <UserFeedBackView isOpen={isOpen} setIsOpen={setIsOpen} /> */}
    </div>
  )
}
