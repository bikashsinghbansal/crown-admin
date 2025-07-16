import { DataTable, GoBackButton, Pagination } from "../../components";
import {
  Column,
  HeaderProps,
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
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { deleteConfirmation, get, remove } from "../../utills";
import { toast } from "react-toastify";

export function InquiryList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type");

  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<boolean | string>("");
  const [inquiryTypes, setInquiryTypes] = useState<string[]>([]);
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (type == "certificateAndCatalogue") {
      setInquiryTypes(["CATALOGUE", "CERTIFICATE"]);
    } else if (type == "generalAndProduct") {
      setInquiryTypes(["GENERAL", "PRODUCT"]);
    } else {
      setInquiryTypes([]);
    }
  }, [type]);

  // Get Data From Database
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/inquiries?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (status) url += `&inquiryStatus=${status}`;
        for (let inqType of inquiryTypes) {
          url += `&inquiryTypes=${inqType}`;
        }

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
      status,
      inquiryTypes,
    ]
  );

  type InquiryStatus = "PENDING" | "RESOLVED";

  type Record = {
    nameNmobile: any;
    email: string;
    inquiryType: "ALL" | "PRODUCT" | "CAREER" | "GENERAL";
    source: "ALL" | "PRODUCT" | "CAREER" | "GENERAL";
    createdAt: string;
    inquiryStatus: InquiryStatus;
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
        Header: "USER",
        accessor: "nameNmobile",
      },

      {
        Header: "EMAIL",
        accessor: "email",
      },

      {
        Header: "INQUIRY TYPE",
        accessor: "inquiryType",
      },

      {
        Header: "SOURCE",
        accessor: "source",
      },

      {
        Header: "CREATED AT",
        accessor: "createdAt",
        Cell: ({ value }: any) => {
          return moment(new Date(value)).format("DD-MM-YYYY");
        },
      },
      {
        Header: "STATUS",
        accessor: "inquiryStatus",
        Cell: ({ value }: any) => {
          const inquiryStatus: InquiryStatus = value;
          return (
            <>
              {inquiryStatus === "PENDING" ? (
                <span className="badge bg-danger">Pending</span>
              ) : (
                <span className="badge bg-success">Resolved</span>
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
                  pathname: `/inquiries/edit/${value}`,
                }}
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              <Link
                className="p-2 bg-light text-warning"
                to={{
                  pathname: `/inquiries/details/${value}`,
                }}
              >
                <span className="fas fa-eye" aria-hidden="true"></span>
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
        nameNmobile: (
          <>
            <p className="p-0 m-0">{data.name}</p>
            <p className="p-0 m-0">{data.mobile}</p>
          </>
        ),
        email: data.email,
        inquiryType: data.inquiryType,
        source: data.source,
        createdAt: data.createdAt,
        inquiryStatus: data.inquiryStatus,
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
      apiResponse = await remove(`/inquiries`, recordId);
    } else {
      apiResponse = await remove(`/inquiries/${recordId}`);
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

  // handleSetStatus
  function handleSetStatus(evt: React.ChangeEvent<HTMLInputElement>) {
    setStatus(evt.target.value);
  }

  // handleSetInquiryTypes
  function handleSetInquiryTypes(evt: React.ChangeEvent<HTMLInputElement>) {
    // setInquiryTypes(evt.target.value);

    let value = evt.target.value;

    if (inquiryTypes.includes(value)) {
      let filtered = inquiryTypes.filter((item) => item != value);
      setInquiryTypes(filtered);
    } else {
      setInquiryTypes([...inquiryTypes, value]);
    }
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Inquiries</h4>
            </div>
            <div>
              <Link
                to={"/inquiries/add"}
                type="button"
                className="btn btn-primary text-light"
              >
                Add Inquiry
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card rounded-2">
            <div className="card-body shadow-none">
              <div className="row mb-2 gy-2">
                <div className="col-md-8">
                  <input
                    placeholder="Serach..."
                    className="form-control py-2"
                    type="serach"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(evt.target.value)
                    }
                  />
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
                      <i className="ti-layers"></i>
                    </a>

                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuLink"
                    >
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypeAll"
                          value={"ALL"}
                          name="inquiryType"
                          onChange={(evt) => {
                            if (evt.target.checked) {
                              setInquiryTypes([
                                "GENERAL",
                                "PRODUCT",
                                "CAREER",
                                "COMPLAINS",
                                "EXPORT",
                                "PRICE",
                                "SAMPLING",
                                "SUPPLIER",
                                "CATALOGUE",
                                "CERTIFICATE",
                              ]);
                            } else {
                              setInquiryTypes([]);
                            }
                          }}
                        />
                        <label htmlFor="inquiryTypeAll">All</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypeGeneral"
                          value={"GENERAL"}
                          name="inquiryType"
                          checked={inquiryTypes.includes("GENERAL")}
                          onChange={handleSetInquiryTypes}
                        />
                        <label htmlFor="inquiryTypeGeneral">General</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypeProduct"
                          value={"PRODUCT"}
                          name="inquiryType"
                          checked={inquiryTypes.includes("PRODUCT")}
                          onChange={handleSetInquiryTypes}
                        />
                        <label htmlFor="inquiryTypeProduct">Product</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypeCareer"
                          value={"CAREER"}
                          name="inquiryType"
                          checked={inquiryTypes.includes("CAREER")}
                          onChange={handleSetInquiryTypes}
                        />
                        <label htmlFor="inquiryTypeCareer">Career</label>
                      </li>

                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypeComplains"
                          value={"COMPLAINS"}
                          name="inquiryType"
                          checked={inquiryTypes.includes("COMPLAINS")}
                          onChange={handleSetInquiryTypes}
                        />
                        <label htmlFor="inquiryTypeComplains">Complain</label>
                      </li>

                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypeExport"
                          value={"EXPORT"}
                          name="inquiryType"
                          checked={inquiryTypes.includes("EXPORT")}
                          onChange={handleSetInquiryTypes}
                        />
                        <label htmlFor="inquiryTypeExport">Export</label>
                      </li>

                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypePrice"
                          value={"PRICE"}
                          name="inquiryType"
                          checked={inquiryTypes.includes("PRICE")}
                          onChange={handleSetInquiryTypes}
                        />
                        <label htmlFor="inquiryTypePrice">Price</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypeSampling"
                          value={"SAMPLING"}
                          name="inquiryType"
                          checked={inquiryTypes.includes("SAMPLING")}
                          onChange={handleSetInquiryTypes}
                        />
                        <label htmlFor="inquiryTypeSampling">Sampling</label>
                      </li>

                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypeSupplier"
                          value={"SUPPLIER"}
                          name="inquiryType"
                          checked={inquiryTypes.includes("SUPPLIER")}
                          onChange={handleSetInquiryTypes}
                        />
                        <label htmlFor="inquiryTypeSupplier">Supplier</label>
                      </li>

                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypeCatalogue"
                          value={"CATALOGUE"}
                          name="inquiryType"
                          checked={inquiryTypes.includes("CATALOGUE")}
                          onChange={handleSetInquiryTypes}
                        />
                        <label htmlFor="inquiryTypeCatalogue">Catalogue</label>
                      </li>

                      <li className="d-flex px-3 gap-2">
                        <input
                          type="checkbox"
                          id="inquiryTypeCertificate"
                          value={"CERTIFICATE"}
                          name="inquiryType"
                          checked={inquiryTypes.includes("CERTIFICATE")}
                          onChange={handleSetInquiryTypes}
                        />
                        <label htmlFor="inquiryTypeCertificate">
                          Certificate
                        </label>
                      </li>
                    </ul>
                  </div>

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
                          value={"ALL"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="all">All</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="active"
                          value={"PENDING"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="active">Pending</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="disabled"
                          value={"RESOLVED"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="disabled">Resolved</label>
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
  );
}
