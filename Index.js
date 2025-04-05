const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://nareshs2812:2812@cluster0.l37bxbu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/Main_Blog', {
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// User schema and model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Blog schema and model
const BlogSchema = new mongoose.Schema({
    blogName: { type: String, required: true },
    author: { type: String, required: true },
    theme: { type: String, required: true },
    information: { type: String, required: true },
    url: { type: String },
});

const Blog = mongoose.model('Blog', BlogSchema);

// Subscription schema and model
const SubscriptionSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribed: { type: Boolean, default: true },
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Store the plain-text password (NOT SECURE)
        const newUser = new User({ username, password });
        await newUser.save();

        res.status(200).json({ message: 'Registration successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the plain-text password (NOT SECURE)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Create Blog endpoint
app.post('/create-blog', async (req, res) => {
    const { blogName, author, theme, information, url } = req.body;

    try {
        const newBlog = new Blog({ blogName, author, theme, information, url });
        await newBlog.save();
        res.status(200).json({ message: 'Blog created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create blog' });
    }
});

// Get all blogs
app.get('/get-blogs', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve blogs' });
    }
});

// Delete Blog
app.delete('/delete-blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Blog.findByIdAndDelete(id);
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error('Error deleting blog:', err);
        res.status(500).json({ message: 'Failed to delete blog' });
    }
});

// Update Blog
app.put('/update-blog/:id', async (req, res) => {
    const { id } = req.params;
    const { blogName, author, theme, information, url } = req.body;

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { blogName, author, theme, information, url },
            { new: true }
        );
        res.status(200).json(updatedBlog);
    } catch (err) {
        console.error('Error updating blog:', err);
        res.status(500).json({ message: 'Failed to update blog' });
    }
});

// Subscription endpoint
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nareshsivakumar387@gmail.com',
        pass: 'knlj szpc brrm ktmm' // Consider using environment variables for security
    }
});

// Subscription endpoint
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    const mailOptions = {
        from: 'nareshsivakumar387@gmail.com',
        to: email, // Use the user's email
        subject: 'Welcome Message',
        text: "Hello, you have registered successfully!"
    };

    try {
        // Send the email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Successfully subscribed and email sent!' });
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ message: 'Failed to subscribe and send email' });
    }
});

// Start the server
app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});

