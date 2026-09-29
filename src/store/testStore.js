import { create } from "zustand";
import { api } from "../api/client";
import { compressImageIfNeeded } from "../utils/compressImage";

export const useTestStore = create((set, get) => ({
    generatedTest: null,
    isGenerating: false,
    error: null,
    myTests: [],
    testFolders: [],

    fetchMyTests: async () => {
        const { data } = await api.get("/tests/mine");
        set({ myTests: Array.isArray(data) ? data : [] });
    },

    fetchTestFolders: async () => {
        const { data } = await api.get("/tests/folders");
        set({ testFolders: Array.isArray(data) ? data : [] });
    },

    createTestFolder: async ({ name, parentId }) => {
        const { data } = await api.post("/tests/folders", { name, parentId });
        set((state) => ({ testFolders: [...state.testFolders, data] }));
        return data;
    },

    renameTestFolder: async (folderId, name) => {
        await api.patch(`/tests/folders/${folderId}/rename`, { name });
        const { data } = await api.get("/tests/folders");
        set({ testFolders: Array.isArray(data) ? data : [] });
    },

    moveTestFolder: async (folderId, parentId) => {
        await api.patch(`/tests/folders/${folderId}/move`, { parentId });
        const { data } = await api.get("/tests/folders");
        set({ testFolders: Array.isArray(data) ? data : [] });
    },

    deleteTestFolder: async (folderId) => {
        await api.delete(`/tests/folders/${folderId}`);
        const [folders, tests] = await Promise.all([api.get("/tests/folders"), api.get("/tests/mine")]);
        set({
            testFolders: Array.isArray(folders.data) ? folders.data : [],
            myTests: Array.isArray(tests.data) ? tests.data : [],
        });
    },

    moveTestToFolder: async (testId, folderId) => {
        await api.patch(`/tests/${testId}/folder`, { folderId });
        const { data } = await api.get("/tests/mine");
        set({ myTests: Array.isArray(data) ? data : [] });
    },

    generateTest: async ({ images, title, timerMode, secondsPerQuestion, mode, questionCount }) => {
        set({ isGenerating: true, error: null });
        try {
            const formData = new FormData();
            const uploadImages = await Promise.all(images.map(compressImageIfNeeded));
            uploadImages.forEach((img) => formData.append("images", img));
            formData.append("title", title);
            formData.append("timerMode", timerMode);
            formData.append("secondsPerQuestion", secondsPerQuestion);
            formData.append("mode", mode);
            if (questionCount) {
                formData.append("questionCount", questionCount);
            }

            const { data } = await api.post("/generate", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            set({ generatedTest: data, isGenerating: false });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.message || "Generation failed", isGenerating: false });
            throw err;
        }
    },

    activeAttempt: null,
    results: null,

    startAttempt: async (testId) => {
        set({ results: null });
        const { data } = await api.post("/attempts/start", { testId });
        set({ activeAttempt: data });
        return data;
    },

    submitAttempt: async (answers) => {
        const attempt = get().activeAttempt;
        const payload = {
            answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
                questionId: Number(questionId),
                selectedOption,
            })),
        };
        const { data } = await api.post(`/attempts/${attempt.attemptId}/submit`, payload);
        set({ results: data, activeAttempt: null });
        return data;
    },

    publicTests: [],

    fetchPublicTests: async () => {
        const { data } = await api.get("/tests/public");
        set({ publicTests: Array.isArray(data) ? data : [] });
    },

    publishTest: async (testId) => {
        await api.post(`/tests/${testId}/publish`);
        // refresh both lists so the UI reflects the change immediately
        const mine = await api.get("/tests/mine");
        set({ myTests: Array.isArray(mine.data) ? mine.data : [] });
    },

    deleteTest: async (testId) => {
        await api.delete(`/tests/${testId}`);
        const mine = await api.get("/tests/mine");
        set({ myTests: Array.isArray(mine.data) ? mine.data : [] });
    },

}));
