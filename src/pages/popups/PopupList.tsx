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
import { FILE_URL } from "../../constants";
import { ReactHelmet } from "../../components/ui/ReactHelmet";

export function PopupList() {
  const [, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<boolean | string>("");
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  // Extend the TableInstance type
  type TableInstanceWithRowSelect<T extends object> = TableInstance<T> & {
    selectedFlatRows: Row<T>[];
  };

  // Get Data From Database
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/popups?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (status) url += `&status=${status}`;

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
    [pagination.page, pagination.limit, searchQuery, needReload, status]
  );

  type Record = {
    title: any;
    popupType: string;
    image: string;
    createdAt: any;
    status: any;
    id: any;
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
        Header: "",
        accessor: "image",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          if (value) {
            return (
              <div>
                <img className="img" src={value} />
              </div>
            );
          } else {
            return null;
          }
        },
      },

      {
        Header: "TITLE",
        accessor: "title",
      },

      {
        Header: "POPUP TYPE",
        accessor: "popupType",
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
        accessor: "status",
        Cell: ({ value }: any) => {
          return (
            <>
              {value === true ? (
                <span className="badge bg-success">Active</span>
              ) : (
                <span className="badge bg-danger">Disabled</span>
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
                  pathname: `/popups/edit/${value}`,
                }}
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
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
        title: data.title,
        popupType: data.popupType,
        image: `${FILE_URL}/${data.image}`,
        createdAt: data.createdAt,
        status: data.status,
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

      // Use a custom hook to add selection functionality
      // (hooks) => {
      //   hooks.visibleColumns.push((columns) => [
      //     {
      //       id: "selection",
      //       disableSortBy: true,
      //       Header: ({ getToggleAllRowsSelectedProps }) => (
      //         <div>
      //           <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
      //         </div>
      //       ),
      //       Cell: ({ row }) => (
      //         <div>
      //           <input type="checkbox" {...row.getToggleRowSelectedProps()} />
      //         </div>
      //       ),
      //     },
      //     ...columns,
      //   ]);
      // }
    ) as TableInstanceWithRowSelect<Record>;

  // handleDeleteData
  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();

    if (!isConfirmed) {
      return;
    }

    let apiResponse = null;
    if (Array.isArray(recordId)) {
      apiResponse = await remove(`/popups`, recordId);
    } else {
      apiResponse = await remove(`/popups/${recordId}`);
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

  return (
    <>
      <ReactHelmet title="Popup List : Crown" description="Popup List" />
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Popup List</h4>
              </div>
              <div>
                <Link
                  to={"/popups/add"}
                  type="button"
                  className="btn btn-primary text-light"
                >
                  Add Popup
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
                  <div className="col-8">
                    <input
                      placeholder="Serach..."
                      className="form-control py-2"
                      type="serach"
                      onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchQuery(evt.target.value)
                      }
                    />
                  </div>
                  <div className="col-4 d-flex gap-2 justify-content-md-end">
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
                            name="status"
                            onChange={handleSetStatus}
                          />
                          <label htmlFor="all">All</label>
                        </li>
                        <li className="d-flex px-3 gap-2">
                          <input
                            type="radio"
                            id="active"
                            value={"true"}
                            name="status"
                            onChange={handleSetStatus}
                          />
                          <label htmlFor="active">Active</label>
                        </li>
                        <li className="d-flex px-3 gap-2">
                          <input
                            type="radio"
                            id="disabled"
                            value={"false"}
                            name="status"
                            onChange={handleSetStatus}
                          />
                          <label htmlFor="disabled">Disabled</label>
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
