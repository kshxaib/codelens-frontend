import { create } from "zustand";
import api from "../services/api";

const useRepositoryStore = create((set) => ({
  repositories: [],
  loading: false,
  error: null,

  fetchRepositories: async () => {
    set({loading: true, error: null});

    try {
      const { data } = await api.get( "/api/repositories");

      set({repositories: data.repositories, loading: false,});
    } 
    catch (error) {
      set({error:error.response?.data?.detail || "Failed to load repositories",loading: false,});
    }
  },

  addRepository: async (url) => {
    const { data } = await api.post("/api/repositories/add",{ url });

    set((state) => ({
      repositories: [data, ...state.repositories.filter(repo => repo.id !== data.id),],
    }));

    return data;
  },

  removeRepository: async (repositoryId) => {
    await api.delete(
      `/api/repositories/${repositoryId}`
    );

    set((state) => ({
      repositories:
        state.repositories.filter(
          (repo) => repo.id !== repositoryId
        ),
    }));
  },
}));

export default useRepositoryStore;