import Header from "./header";
import Footer from "./footer";
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="bg-white w-full flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
