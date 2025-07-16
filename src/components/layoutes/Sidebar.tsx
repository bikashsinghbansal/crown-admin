import { Link, useNavigate } from "react-router-dom";

export function Sidebar() {
  const navigation = useNavigate();

  function handelLogout(evt: React.MouseEvent<HTMLElement>) {
    evt.preventDefault();
    localStorage.removeItem("token");
    navigation("/login");
  }

  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item">
          <Link className="nav-link active" to="/">
            <i className="ti-shield menu-icon"></i>
            {/* <TfiDashboard className="menu-icon" /> */}
            <span className="menu-title">DASHBOARD</span>
          </Link>
        </li>

        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#setting"
            aria-expanded="false"
            aria-controls="setting"
          >
            <i className="ti-settings menu-icon"></i>
            <span className="menu-title">Setting</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="setting">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className="nav-link" to="/carousels">
                  Carousel
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/popups">
                  Popup
                </Link>
              </li>
            </ul>
          </div>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/media">
            <i className="ti-image menu-icon"></i>
            <span className="menu-title">Media</span>
          </Link>
        </li>

        {/* Categories */}
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#categories"
            aria-expanded="false"
            aria-controls="categories"
          >
            <i className="ti-layers menu-icon"></i>
            <span className="menu-title">Categories</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="categories">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className="nav-link" to="/categories">
                  Categories
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/subCategories">
                  Sub Categories
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Catalogue */}
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#catalogue"
            aria-expanded="false"
            aria-controls="catalogue"
          >
            <i className="ti-layers menu-icon"></i>
            <span className="menu-title">Catalogue</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="catalogue">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className="nav-link" to="/catalogueCategories">
                  Catalogue Categories
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/catalogues">
                  Catalogue
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Certificate */}
        <li className="nav-item">
          <Link className="nav-link" to="/certificates">
            <i className="ti-crown menu-icon"></i>
            <span className="menu-title">Certificates</span>
          </Link>
        </li>

        {/* Pages */}
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#pages"
            aria-expanded="false"
            aria-controls="pages"
          >
            <i className="ti-layers menu-icon"></i>
            <span className="menu-title">Pages</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="pages">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className="nav-link" to="/homepage">
                  Home Page
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Orders */}
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#orders"
            aria-expanded="false"
            aria-controls="orders"
          >
            <i className="ti-user menu-icon"></i>
            <span className="menu-title">Orders</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="orders">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className="nav-link" to="/orders">
                  Orders
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Inquiries */}
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#inquiries"
            aria-expanded="false"
            aria-controls="inquiries"
          >
            <i className="ti-email menu-icon"></i>
            <span className="menu-title">Inquiries</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="inquiries">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className="nav-link" to="/newsletters">
                  Newsletter Emails
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/inquiries">
                  All Inquiry
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/inquiries?type=certificateAndCatalogue"
                >
                  Certificate & Catelogue
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/inquiries?type=generalAndProduct"
                >
                  General & Products
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Products */}
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#products"
            aria-expanded="false"
            aria-controls="products"
          >
            <i className="ti-files menu-icon"></i>
            <span className="menu-title">Products</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="products">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className="nav-link" to="/sizes">
                  Sizes
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/finishes">
                  Finishes
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/sizeFinishes">
                  Size And Finishe
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/decorSeries">
                  Decor Series
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products">
                  Products
                </Link>
              </li>
            </ul>
          </div>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#" onClick={handelLogout}>
            <i className="ti-power-off menu-icon"></i>
            <span className="menu-title">Logout</span>
          </a>
        </li>

        {/* <li className="nav-item">
          <a className="nav-link" href="pages/charts/chartjs.html">
            <i className="ti-power-off menu-icon"></i>
            <span className="menu-title">Pages</span>
          </a>
        </li> */}
      </ul>
    </nav>
  );
}
