# GIF Splitter

This project is a web application that allows users to upload an animated GIF, split it into a grid of smaller GIFs, and display them in a synchronized manner. The tool also provides a preview of the original GIF alongside the split result.

## Features

- Upload an animated GIF.
- Specify the grid dimensions (rows and columns).
- Split the GIF into smaller synchronized GIFs based on the grid dimensions.
- Preview the original GIF and the split GIFs side by side.
- Loading progress bar during GIF processing.
- Reset the form to upload a new GIF and clear the current split results.

## Setup and Running Instructions

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine. You can download it from [here](https://nodejs.org/).
- **NPM**: NPM is installed automatically with Node.js.

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/gif-splitter.git
   cd gif-splitter
   ```
2. **Install dependencies**: Navigate to the project directory and install the necessary packages by running:
   ```bash
   npm install
   ```
3. **Start the server**: Once the dependencies are installed, start the server using the following command:
   ```bash
   node server.js
   ```
4. **Access the application**: Open your web browser and visit:
   ```plaintext
   http://localhost:3000
   ```

### Folder Structure

```plaintext
gif-splitter/
│
├── public/                    # Contains static assets like HTML and CSS
│   └── index.html              # Main HTML page
│
├── uploads/                   # Stores uploaded GIF files temporarily
├── output/                    # Stores split GIF output files
├── server.js                  # Express server setup
├── gifProcessor.js            # Logic for GIF processing and splitting
├── package.json               # Project metadata and dependencies
└── README.md                  # Project documentation
```

### Dependencies

The following libraries were used in this project:

- **express**: A minimal and flexible Node.js web application framework.
- **multer**: A middleware for handling file uploads.
- **canvas**: Node.js package for manipulating image data.
- **gif-encoder-2**: A GIF encoder for creating new GIFs.
- **omggif**: A library for decoding GIFs.
- **gifuct-js**: A JavaScript library to parse and decode GIFs.

## Approach

- **User Input and GIF Upload**: Users upload a GIF file, and they can specify the number of rows and columns to split the GIF into.
- **GIF Processing**: The server processes the uploaded GIF, splits it into multiple smaller GIFs based on the specified grid, and stores the smaller GIFs.
- **Synchronized Output**: The smaller GIFs are displayed in a grid layout and synchronized to play in unison.
- **Preview and Output**: The original GIF is previewed side by side with the smaller, split GIFs.

### Key Functions

- **splitGIFIntoGrid**: This function reads the GIF data, splits the image into smaller frames based on the user's input, and creates separate GIF files.
- **applyDisposalMethod and mergeFrameData**: These functions handle transparency and frame merging, ensuring that the split GIFs retain the animation’s original look.

## Challenges Faced

- **Synchronization**: One of the challenges was ensuring that the split GIFs remain synchronized when displayed in the grid. Handling frame delays and disposal methods required careful processing to maintain the correct appearance.
- **GIF Transparency**: Properly managing transparent GIFs was a significant challenge, particularly ensuring that transparent frames did not cause black traces in subsequent frames.
- **Performance**: Processing large GIF files or splitting into many smaller GIFs can be performance-intensive. Optimizing the GIF processing and ensuring a smooth user experience with the loading bar were critical to the project’s success.