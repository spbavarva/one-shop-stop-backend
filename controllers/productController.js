const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

//create Product ADMIN
exports.createProduct = catchAsyncError(async (req, res, next) => {
  // let images = [];

  // if (typeof req.body.images === "string") {
  //   images.push(req.body.images);
  // } else {
  //   images = req.body.images;
  // }

  // const imagesLinks = [];

  // for (let i = 0; i < images.length; i++) {
  //   const result = await cloudinary.v2.uploader.upload(images[i], {
  //     folder: "products"
  //   });

  //   imagesLinks.push({
  //     public_id: result.public_id,
  //     url: result.secure_url
  //   });
  // }

  // console.log(`req.body`);

  // req.body.images = imagesLinks;
  // req.body.user = req.user.id;

  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];
  for (let i = 0; i < images.length; i++) {
    // const result = await cloudinary.v2.uploader.upload(images[i], {
    //   folder: "products"
    // });

    // const result = await cloudinary.v2.uploader.upload(images[i], {
    //   folder: "products"
    // });

    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products"
    });
    
    console.log("create product 3");

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;
  const product = await Product.create(req.body);

  res.status(201).json({ success: true, product });
});

//get All Products
exports.getAllProducts = catchAsyncError(async (req, res) => {
  const resultPerPage = 5;
  const productsCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  // const products = await Product.find();
  let products = await apiFeature.query;
  res.status(200).send({
    success: true,
    products,
    productsCount,
    resultPerPage
  });
});

//get All Products -- ADMIN
exports.getAdminProducts = catchAsyncError(async (req, res) => {
  const products = await Product.find();

  res.status(200).send({
    success: true,
    products
  });
});

//get single Product Details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }

  res.status(200).json({ success: true, product });
});

//Update Product -- ADMIN
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }

  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products"
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url
      });
    }
    console.log("req.body", req.body);
    req.body.images = imagesLinks;
  }

  await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidaters: true,
    useFindAndModify: false
  });

  res.status(200).json({ success: true, product });
});

//Delete Product ADMIN
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  // if (!product) {
  //   return res.status(500).json({
  //     success: false,
  //     message: "Product not found",
  //   });
  // }

  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }

  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  await Product.findOneAndDelete({ _id: req.params.id });
  res
    .status(200)
    .json({ success: true, message: "Product removed successfully", product });
});

//Create New Review or Update last Review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (revcomment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReview = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

// Get All Reviews of a product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews
  });
});

//Delete Review of Product
exports.deleteProductReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  const ratings = avg / reviews.length;

  const numOfReview = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    { ratings, numOfReview, reviews },
    { new: true, runValidaters: true, useFindAndModify: false }
  );

  res.status(200).json({
    success: true,
    reviews: product.reviews
  });
});
