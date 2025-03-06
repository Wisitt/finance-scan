import UserSelector from './UserSelector';
import { ModeToggle } from './mode-toggle';

export default function Header() {
  return (
    <header className="w-full border-b bg-background sticky top-0 z-10">
      <div className="h-16 items-center justify-end px-4 md:px-6 flex">
        <div className="flex items-center gap-4">
          <UserSelector />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}