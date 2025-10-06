import CitizenLayout from '@/components/citizen/CitizenLayout';

export default function CitizenPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CitizenLayout>{children}</CitizenLayout>;
}
