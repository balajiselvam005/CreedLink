import NavItem from "./ui/NavItem";

export default function Navbar() {
  return (
    <nav>
      <ul className="flex items-center gap-6">
        <li>
          <NavItem href="/">Home</NavItem>
        </li>

        <li>
          <NavItem href="/explore-creators">Creators</NavItem>
        </li>

        <li>
          <NavItem href="/auth" variant="login">
            Login
          </NavItem>
        </li>
      </ul>
    </nav>
  );
}
