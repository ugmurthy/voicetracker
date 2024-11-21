
import MarkdownIt from 'markdown-it';
import parse from 'html-react-parser';

const Markdown = ({ markdown }) => {
  // Initialize markdown-it with default settings
  const md = new MarkdownIt({
    html: true,        // Enable HTML tags in source
    breaks: true,      // Convert '\n' in paragraphs into <br>
    linkify: true,     // Autoconvert URL-like text to links
  });

  // Convert markdown to HTML
  const htmlContent = md.render(markdown);

  // Parse HTML to React elements
  return <div>{parse(htmlContent)}</div>;
};

export default Markdown;