import { create } from "zustand";
import api from "../services/api";

const useRepositoryStore = create((set) => ({
  repositories: [],
  loading: false,
  error: null,

  // Get all repositories from backend
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

  // Add repository using GitHub URL
  addRepository: async (url) => {
    const { data } = await api.post("/api/repositories/add",{ url });

    set((state) => ({
      repositories: [data, ...state.repositories.filter(repo => repo.id !== data.id),],
    }));

    return data;
  },

  // Remove repository from current user's access
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

  // Index repository 
  indexRepository: async (repositoryId) => {

    // Immediately show indexing state in UI
    set((state) => ({
      repositories: state.repositories.map((repo) => repo.id === repositoryId ? { ...repo, index_status: "indexing" } : repo),
    }));

    try {
      const { data } = await api.post(
        `/api/repositories/${repositoryId}/index`
      );
 
      // Backend response ke according repository update
      set((state) => ({
        repositories:
          state.repositories.map((repo) =>
            repo.id === repositoryId
              ? {
                  ...repo,
                  index_status: data.status,
                  file_count: data.files_scanned,
                  symbol_count: data.symbols_found,
                  last_indexed_commit: data.commit_sha,
                }
              : repo
          ),
      }));

      return data;

    } catch (error) {

      // Indexing fail hua to failed state show karo
      set((state) => ({
        repositories:
          state.repositories.map((repo) =>
            repo.id === repositoryId
              ? {
                  ...repo,
                  index_status: "failed",
                }
              : repo
          ),
      }));

      throw error;
    }
  },

  // Ask a question about a repository
  askRepository: async (repositoryId, question) => {
    const { data } = await api.post(`/api/repositories/${repositoryId}/ask`,{question});

    return data;
  },
}));

export default useRepositoryStore;