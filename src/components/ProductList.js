import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './ProductList.css';
import { getProducts, getFav, deleteFromFav, addToFav, getAllCart } from '../api';
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import StarRating from "./star-rating/star-rating";

const brands = ["Brand A", "Brand B", "Brand C"];

export default function ProductList({ user }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [hoveringBrand, setHoveringBrand] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);  // Current page
    const [productsPerPage] = useState(13);  // Number of products per page

    const navigate = useNavigate();

    useEffect(() => {
        getProducts().then(data => setProducts(data));
    }, []);

    useEffect(() => {
        if (user) {
            getFav(user.id).then((data) => setFavorites(data));
        }
        getAllCart().then((data) => setCart(data));
    }, [user]);

    function handleScrollPercentage() {
        const howMuchScrolled = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        setScrollPercentage((howMuchScrolled / height) * 100);
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScrollPercentage);
        return () => {
            window.removeEventListener('scroll', handleScrollPercentage);
        };
    }, []);

    const handleCategorySelection = (category) => {
        setSelectedCategory(category);
        setSelectedBrand(null);
    };

    const handleProductClick = (id) => {
        navigate(`/products/${id}`);
    };

    const toggleFavorite = async (product) => {
        if (!user) {
            alert("Please login to add items to the favorites.");
            return;
        }
        try {
            const userId = String(user.id);
            const existingFav = favorites.find((item) => item.id === product.id);

            if (existingFav) {
                await deleteFromFav(existingFav.id);
                setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== product.id)); // Update local favorites
                alert(`${product.name} has been removed from your favorites.`);
            } else {
                await addToFav({ ...product, userId });
                setFavorites(prevFavorites => [...prevFavorites, product]); // Update local favorites
                alert(`${product.name} has been added to your favorites.`);
            }
        } catch (error) {
            console.error("Error toggling favorite item:", error);
            alert("An error occurred while updating your favorites.");
        }
    };

    const calculateAverageRatings = (cart) => {
        const productRatings = {};
        cart.forEach((item) => {
            if (!productRatings[item.id]) {
                productRatings[item.id] = { totalRating: 0, ratingCount: 0 };
            }
            productRatings[item.id].totalRating += item.rating;
            productRatings[item.id].ratingCount += 1;
        });

        return cart.map((item) => {
            const avgRating =
                productRatings[item.id].totalRating / productRatings[item.id].ratingCount;
            return {
                ...item,
                averageRating: avgRating.toFixed(2),
            };
        });
    };

    const updatedCart = calculateAverageRatings(cart);

    const filteredProducts = selectedCategory
        ? selectedCategory === "Brand" && selectedBrand
            ? products.filter((product) => product.brand === selectedBrand)
            : products.filter((product) => product.category === selectedCategory)
        : products;

    // Get current page's products
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate total pages
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    return (
        <div className="shop-page">
            <div className="top-container">
                <div className="scroll-progress-tracking-container">
                    <div className="current-progress-bar" style={{ width: `${scrollPercentage}%` }}></div>
                </div>
            </div>

            <div className="category-selection">
                <button onClick={() => handleCategorySelection("Women")}>Women</button>
                <button onClick={() => handleCategorySelection("Men")}>Men</button>

                <div
                    className="brand-dropdown"
                    onMouseEnter={() => setHoveringBrand(true)}
                    onMouseLeave={() => setHoveringBrand(false)}
                >
                    <button onClick={() => handleCategorySelection("Brand")}>Brand</button>

                    {hoveringBrand && (
                        <div className="brand-list">
                            {brands.map((brand) => (
                                <button key={brand} onClick={() => setSelectedBrand(brand)}>
                                    {brand}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="product-list">
                {currentProducts.map((product) => {
                    const isFavorite = favorites.some((item) => item.id === product.id);
                    const updatedProduct = updatedCart.find(item => item.id === product.id);

                    return (
                        <div key={product.id} className="product-item">
                            <img src={product.image} alt={product.name} className="product-image" />
                            <h3 onClick={() => handleProductClick(product.id)} className="product-name">
                                {product.name}
                            </h3>
                            <p style={{ color: "red" }}>{product.price}</p>
                            <p>{product.brand}</p>

                            <button
                                onClick={() => toggleFavorite(product)}
                                className="favorite-button"
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "24px",
                                }}
                            >
                                {isFavorite ? <AiFillHeart color="rgb(241, 103, 158)" /> : <AiOutlineHeart />}
                            </button>
                            {updatedProduct && (
                                <div>
                                    <StarRating
                                        numberOfStars={5}
                                        rating={updatedProduct.averageRating}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="pagination">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}  // Disable on the first page
                    className="pagination-arrow"
                >
                    &lt; {/* Less than sign for previous */}
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}

                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}  // Disable on the last page
                    className="pagination-arrow"
                >
                    &gt; {/* Greater than sign for next */}
                </button>
            </div>

        </div>
    );
}
