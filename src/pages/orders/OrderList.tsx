import { DataTable, GoBackButton, Pagination } from "../../components";
import {
  Column,
  Row,
  TableInstance,
  useFilters,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { deleteConfirmation, get, remove } from "../../utills";
import { toast } from "react-toastify";

import { DateRangePicker } from "react-date-range";
import { enUS } from "date-fns/locale";
import { ReactHelmet } from "../../components/ui/ReactHelmet";

export function OrderList() {
  const [, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<boolean | string>("");
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 5)),
    endDate: new Date(), // today
    key: "selection",
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/orders?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (orderStatus) url += `&orderStatus=${orderStatus}`;

        if (selectionRange.startDate)
          url += `&startDate=${selectionRange.startDate}`;
        if (selectionRange.endDate) url += `&endDate=${selectionRange.endDate}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          setRecords(apiResponse.body);
          setPagination({
            ...pagination,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          });
        } else {
          setRecords([]);
          toast.error(apiResponse?.message);
        }
        setLoading(false);
      }

      getData();
    },
    [
      pagination.page,
      pagination.limit,
      searchQuery,
      needReload,
      orderStatus,
      selectionRange,
    ]
  );

  type Record = {
    name: string;
    mobile: string;
    email: string;
    createdAt: string;
    orderStatus: string;
    validity: string;
    id: string;
  };

  // Extend the TableInstance type
  type TableInstanceWithRowSelect<Record extends object> =
    TableInstance<Record> & {
      selectedFlatRows: Row<Record>[];
    };

  const columns: Column<Record>[] = React.useMemo(
    () => [
      {
        id: "selection",
        disableSortBy: true,
        Header: ({ getToggleAllRowsSelectedProps }: any) => (
          <div>
            <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
          </div>
        ),
        Cell: ({ row }: any) => (
          <div>
            <input type="checkbox" {...row.getToggleRowSelectedProps()} />
          </div>
        ),
      },

      {
        Header: "NAME",
        accessor: "name",
      },
      {
        Header: "MOBILE",
        accessor: "mobile",
      },
      {
        Header: "EMAIL",
        accessor: "email",
      },
      {
        Header: "CREATED AT",
        accessor: "createdAt",
        Cell: ({ value }: any) => {
          return moment(new Date(value)).format("DD-MM-YYYY");
        },
      },
      {
        Header: "ORDER STATUS",
        accessor: "orderStatus",
        Cell: ({ value }: any) => {
          return (
            <>
              {value == "ORDER_PLACED" ? (
                <span className="d-flex gap-1">
                  <span className="rounded fa fa-hourglass-start text-warning"></span>
                  <span className="text-warning">ORDER PLACED</span>
                </span>
              ) : value == "DISPATCHED" ? (
                <span className="d-flex gap-1">
                  <span className="rounded fa fa-truck text-info"></span>
                  <span className="text-info">DISPATCHED</span>
                </span>
              ) : value == "DELIVERED" ? (
                <span className="d-flex gap-1">
                  <span className="rounded fa fa-check-circle text-success"></span>
                  <span className="text-success">DELIVERED</span>
                </span>
              ) : value == "CANCELLED" ? (
                <span className="d-flex gap-1">
                  <span className="rounded fa fa-check-circle text-times text-danger"></span>
                  <span className="text-danger">CANCELLED</span>
                </span>
              ) : value == "RESOLVED" ? (
                <span className="d-flex gap-1">
                  <span className="rounded fa fa-check text-times text-success"></span>
                  <span className="text-success">RESOLVED</span>
                </span>
              ) : (
                ""
              )}
            </>
          );
        },
      },
      {
        Header: "ACTION",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          return (
            <div className="d-flex gap-1">
              <Link
                className="p-2 bg-light"
                to={{
                  pathname: `/orders/edit/${value}`,
                }}
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              <Link
                className="p-2 bg-light"
                to={{
                  pathname: `/orders/details/${value}`,
                }}
              >
                <span
                  className="fas fa-eye text-warning"
                  aria-hidden="true"
                ></span>
              </Link>

              <button
                type="button"
                className="btn p-2 bg-light"
                data-toggle="modal"
                data-target="#deleteModal"
                onClick={() => {
                  handleDeleteData(value);
                }}
              >
                <span
                  className="fas fa-trash-alt text-danger"
                  aria-hidden="true"
                ></span>
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const data = React.useMemo(() => {
    return records.map((data) => {
      return {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        createdAt: data.createdAt,
        orderStatus: data.orderStatus,
        validity: `${moment(data.startDate).format("DD-MMM-YYYY")} to ${moment(
          data.expiryDate
        ).format("DD-MMM-YYYY")}`,
        id: data._id,
      };
    });
  }, [records]);

  const { getTableProps, headerGroups, rows, prepareRow, selectedFlatRows } =
    useTable(
      { columns, data },
      useFilters,
      useSortBy,
      usePagination,
      useRowSelect
    ) as TableInstanceWithRowSelect<Record>;

  // handleDeleteData
  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();

    if (!isConfirmed) {
      return;
    }

    let apiResponse = null;
    if (Array.isArray(recordId)) {
      apiResponse = await remove(`/orders`, recordId);
    } else {
      apiResponse = await remove(`/orders/${recordId}`);
    }

    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => {
        return !old;
      });
    } else {
      toast.error(apiResponse?.message);
    }
  }

  function handleSelectedRows(): string[] {
    const selectedData = selectedFlatRows.map((row: any) => row?.original?.id);
    return selectedData;
  }

  // handleSetOrderStatus
  function handleSetOrderStatus(evt: React.ChangeEvent<HTMLInputElement>) {
    setOrderStatus(evt.target.value);
  }

  function handleSelectDateRange(ranges: any) {
    setSelectionRange(ranges.selection);
  }

  return (
    <>
      <ReactHelmet title="Order List : Crown" description="Order List" />
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Orders</h4>
              </div>
              {/* <div>
              <Link
                to={"/orders/add"}
                type="button"
                className="btn btn-primary text-light"
              >
                Add User
              </Link>
            </div> */}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card ">
            <div className="card rounded-2">
              <div className="card-body shadow-none">
                <div className="row mb-2 gy-2">
                  <div className="col-md-8">
                    {/* <input
                    placeholder="Serach..."
                    className="form-control py-2"
                    type="serach"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(evt.target.value)
                    }
                  /> */}

                    {/* Display selected date range */}
                    <span
                      style={{
                        marginTop: "20px",
                        fontSize: "14px",
                        cursor: "pointer",
                        boxShadow: "0px 1px 2px #5a5a5a",
                        padding: 5,
                        borderRadius: 10,
                      }}
                      onClick={() => {
                        setCalendarVisible(!isCalendarVisible);
                      }}
                    >
                      <span className="mt-3">
                        <i className="ti-calendar"></i>
                      </span>{" "}
                      {`${selectionRange.startDate.toDateString()} - ${selectionRange.endDate.toDateString()}`}
                    </span>

                    {isCalendarVisible && (
                      <div
                        style={{
                          marginTop: "10px",
                          position: "absolute",
                          left: "20px",
                          background: "white",
                          padding: "10px",
                          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                          borderRadius: "8px",
                          zIndex: 10,
                        }}
                      >
                        <DateRangePicker
                          ranges={[selectionRange]}
                          onChange={(ranges) => {
                            handleSelectDateRange(ranges);
                          }}
                          locale={enUS}
                          minDate={new Date("2024-01-01")}
                          maxDate={new Date("2028-12-31")}
                          direction="horizontal"
                          editableDateInputs={true}
                          scroll={{ enabled: false }}
                          dateDisplayFormat="dd/MM/yyyy"
                          rangeColors={["#4caf50"]} // Customize the highlight color
                        />

                        <div className="d-flex gap-2 justify-content-end">
                          <div className="">
                            <button
                              className="btn btn-danger p-2"
                              onClick={() => {
                                setCalendarVisible(false); // Close calendar
                                // console.log(
                                //   "Selected Date Range:",
                                //   selectionRange
                                // );
                              }}
                            >
                              Cancel
                            </button>
                          </div>

                          {/* Apply Button */}
                          {/* <div className="">
                          <button
                            className="btn btn-success p-2"
                            onClick={() => {
                              setCalendarVisible(false);
                              console.log(
                                "Selected Date Range:",
                                selectionRange
                              );
                            }}
                          >
                            Apply
                          </button>
                        </div> */}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-md-4 d-flex gap-2 justify-content-md-end">
                    {/* <button className="btn p-2 bg-light border">
                    <i className="ti-search"></i>
                  </button> */}
                    {selectedFlatRows.length ? (
                      <button
                        className="btn p-2 bg-light border"
                        onClick={() => {
                          handleDeleteData(handleSelectedRows());
                        }}
                      >
                        <i className="fas fa-trash-alt text-danger"></i>
                      </button>
                    ) : null}

                    <div className="dropdown">
                      <a
                        className="btn p-2 bg-light border"
                        href="#"
                        role="button"
                        id="dropdownMenuLink"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="ti-filter"></i>
                      </a>

                      <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuLink"
                      >
                        <li className="d-flex px-3 gap-2">
                          <input
                            type="radio"
                            id="all"
                            value={"All"}
                            name="orderStatus"
                            onChange={handleSetOrderStatus}
                          />
                          <label htmlFor="all">All</label>
                        </li>
                        <li className="d-flex px-3 gap-2">
                          <input
                            type="radio"
                            id="orderPlaced"
                            value={"ORDER_PLACED"}
                            name="orderStatus"
                            onChange={handleSetOrderStatus}
                          />
                          <label htmlFor="orderPlaced">ORDER PLACED</label>
                        </li>
                        <li className="d-flex px-3 gap-2">
                          <input
                            type="radio"
                            id="dispatched"
                            value={"DISPATCHED"}
                            name="orderStatus"
                            onChange={handleSetOrderStatus}
                          />
                          <label htmlFor="dispatched">DISPATCHED</label>
                        </li>

                        <li className="d-flex px-3 gap-2">
                          <input
                            type="radio"
                            id="delivered"
                            value={"DELIVERED"}
                            name="orderStatus"
                            onChange={handleSetOrderStatus}
                          />
                          <label htmlFor="delivered">DELIVERED</label>
                        </li>

                        <li className="d-flex px-3 gap-2">
                          <input
                            type="radio"
                            id="cancelled"
                            value={"CANCELLED"}
                            name="orderStatus"
                            onChange={handleSetOrderStatus}
                          />
                          <label htmlFor="cancelled">CANCELLED</label>
                        </li>

                        <li className="d-flex px-3 gap-2">
                          <input
                            type="radio"
                            id="resolved"
                            value={"RESOLVED"}
                            name="orderStatus"
                            onChange={handleSetOrderStatus}
                          />
                          <label htmlFor="resolved">RESOLVED</label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  {/* Data Table */}
                  <DataTable
                    getTableBodyProps={getTableProps}
                    getTableProps={getTableProps}
                    headerGroups={headerGroups}
                    rows={rows}
                    prepareRow={prepareRow}
                  />
                  {/* Pagination */}
                  <Pagination
                    pagination={pagination}
                    setPagination={setPagination}
                    tableName={"table-to-xls"}
                    csvFileName={"coupons"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
