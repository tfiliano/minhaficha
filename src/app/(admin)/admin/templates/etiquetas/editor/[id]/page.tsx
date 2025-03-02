import TemplateEditorPage from "../page";

// Use a more generic approach to bypass type checking
export default function EditTemplatePage({ params }: any) {
  return <TemplateEditorPage params={params} />;
}
