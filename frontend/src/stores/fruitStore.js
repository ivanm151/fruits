import { defineStore } from "pinia";
import { predictFull } from "../services/huggingface";

export const useFruitStore = defineStore("fruit", {
    state: () => ({
        loading: false,
        error: null,
        result: null,
    }),

    actions: {
        async predictFruit({ file, pointX, pointY }) {
            this.loading = true;
            this.error = null;

            try {
                this.result = await predictFull({
                    file,
                    pointX,
                    pointY,
                });
            } catch (err) {
                this.error = err.message || "Prediction failed";
            } finally {
                this.loading = false;
            }
        },

        reset() {
            this.result = null;
            this.error = null;
        },
    },
});
