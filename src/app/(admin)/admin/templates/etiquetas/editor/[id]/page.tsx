import TemplateEditorPage from "../page";

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  return <TemplateEditorPage params={params} />;
}
