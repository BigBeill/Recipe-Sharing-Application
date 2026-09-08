

interface PageProps {
   children: React.ReactNode;
   modal: React.ReactNode;
}

export default function GroupLayout({ children, modal }: PageProps) {
   return <>{children}{modal}</>;
}