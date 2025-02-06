import { api } from "@/api/fake";

const colors = await api.getColors();
const data = await api.getCompanyInfo();

export { colors, data };
