export const calculatePageCount = (products, productsPerPage) => {
    return Math.ceil(products.length / productsPerPage);
};
  
export const getCurrentPageProducts = (products, currentPage, productsPerPage) => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return products.slice(indexOfFirstProduct, indexOfLastProduct);
};

export const getNumberOfPagesNextToActivePage = (numberOfPages) => {
    const numberOfPagesNextToActivePage = numberOfPages <= 7 ? 6 : 1;
    return numberOfPagesNextToActivePage;
};