{/* <div className="flex flex-col md:flex-row items-center justify-between px-[20px] sm:px-[40px] border-b border-[#898181] border-t-1">
          <div className="">
            <div className="flex items-center border-b border-[#ddd] w-[300px] bg-[#fff] rounded-[50px] px-5 py-2 my-3">
              <input
                placeholder="Finn posisjonen din"
                className="placeholder-gray-500 w-full text-[16px] font-medium text-[#333] border-none outline-none h-[40px]"
              />
              <RoomOutlinedIcon
                fontSize="medium"
                className="text-[#757575]"
              />
            </div>
          </div>
          <div className="flex items-center gap-[5px] flex-wrap md:flex-nowrap">
            <div className="flex flex-col md:flex-row items-center w-full md:w-[200px] md:border-r md:border-[#898181] h-[80px]">
              <div className="flex flex-col w-full">
                <p className="text-[18px] text-[#18344e] font-semibold">
                  Showing <span className="text-[#000]">{properties?.length}</span> results
                </p>
              </div>
              <p className="border-t w-full md:border-[#dfdfdf] my-[15px] block md:hidden" />
            </div>

            <div className="w-[250px] md:border-r md:border-[#898181] h-[80px] flex items-center justify-center">
              <select
                value={sortedType}
                onChange={handleSortedType}
                className="h-[40px] text-[18px] cursor-pointer text-[#18344e] font-semibold px-[15px] outline-none"
              >
                <option value="all" className="text-[#333] bg-[#fff]">Alle</option>
                <option value="publish" className="text-[#333] bg-[#fff]">Publisert</option>
                <option value="pricelh" className="text-[#333] bg-[#fff]">Pris lav-høy</option>
                <option value="pricehl" className="text-[#333] bg-[#fff]">Pris høy-lav</option>
              </select>
            </div>

            <div className="flex items-center gap-[20px] md:pl-[15px] md:ml-auto w-[250px] h-[80px] justify-center">
              {roomValue !== 0 || priceValue[0] !== 0 ? (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-[10px] h-[60px] cursor-pointer text-[#333] font-semibold px-[15px] rounded-[5px]"
                >
                  tilbakestille
                  <SyncIcon fontSize="small" className="text-[#fff]" />
                </button>
              ) : (
                <button
                  onClick={handleOpen}
                  className="flex items-center gap-[10px] h-[60px] cursor-pointer text-[#333] font-semibold px-[15px] rounded-[5px]"
                >
                  Filter
                  <TuneIcon fontSize="small" className="text-[#333]" />
                </button>
              )}
            </div>
          </div>
        </div> */}