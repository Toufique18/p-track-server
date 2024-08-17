const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


// Middleware
app.use(express.json());
app.use(cors());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mhvsuxa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    // Connect the client to the server	(optional starting in v4.7)
    //console.log(process.env.DB_USER, process.env.DB_PASS);
    const productCollection = client.db('p-track').collection('product');

     // Fetch all product
  //    app.get("/products", async (req, res) => {
  //     const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  //     const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
  //     const skip = (page - 1) * limit;
  
  //     try {
  //         const result = await productCollection.find({}).skip(skip).limit(limit).toArray();
  //         const totalProducts = await productCollection.countDocuments();
  //         const totalPages = Math.ceil(totalProducts / limit);
  
  //         res.send({
  //             data: result,
  //             totalPages: totalPages,
  //             currentPage: page,
  //         });
  //     } catch (error) {
  //         console.error('Error fetching products:', error);
  //         res.status(500).send({ error: 'Failed to fetch products' });
  //     }
  // });
  
  //for search

//   app.get("/products", async (req, res) => {
//     const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
//     const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
//     const search = req.query.search || ''; // Get the search term from the query
//     const skip = (page - 1) * limit;

//     try {
//         const query = search ? { productName: { $regex: search, $options: 'i' } } : {};
//         const result = await productCollection.find(query).skip(skip).limit(limit).toArray();
//         const totalProducts = await productCollection.countDocuments(query);
//         const totalPages = Math.ceil(totalProducts / limit);

//         res.send({
//             data: result,
//             totalPages: totalPages,
//             currentPage: page,
//         });
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         res.status(500).send({ error: 'Failed to fetch products' });
//     }
// });

//combine search

app.get("/products", async (req, res) => {
  const { page = 1, limit = 10, search = '', brands = '', categories = '', priceRange = '', sort = '' } = req.query;

  // Convert brands and categories into arrays
  const brandsArray = brands ? brands.split(',') : [];
  const categoriesArray = categories ? categories.split(',') : [];

  const query = {};

  // Search filter
  if (search) {
      query.productName = { $regex: search, $options: 'i' };
  }

  // Brand filter
  if (brandsArray.length > 0) {
      query.brandName = { $in: brandsArray };
  }

  // Category filter
  if (categoriesArray.length > 0) {
      query.category = { $in: categoriesArray };
  }

  // Price range filter
  if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(Number);
      query.price = { $gte: minPrice, $lte: maxPrice };
  }

  // Define sorting option
  let sortOption = {};

  if (sort === 'price-asc') {
      sortOption.price = 1; // Sort by price ascending
  } else if (sort === 'price-desc') {
      sortOption.price = -1; // Sort by price descending
  } else if (sort === 'date-desc') {
      sortOption.creationDateTime = -1; // Sort by date added (newest first)
  }

  try {
      const totalItems = await productCollection.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limit);

      const products = await productCollection
          .find(query)
          .sort(sortOption) // Apply sorting
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .toArray();

      res.send({ data: products, totalPages });
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send({ error: 'Failed to fetch products' });
  }
});


  
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

// Root endpoint 
app.get('/', (req, res) => {
    res.send('p-tracker server is running');
  });
  
  
  // Start server
  app.listen(port, () => {
    console.log(`p-tracker server is running on port: ${port}`);
  });
  